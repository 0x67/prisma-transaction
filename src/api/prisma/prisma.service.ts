import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'src/modules/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { PrismaTransactions } from 'src/types';
import { TransactionHost, Transactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class PrismaService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  private fakeData() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const email = faker.internet.email({
      firstName,
      lastName,
    });

    const merchantName = faker.company.name();

    const branchName = `${merchantName} Branch ${faker.location.city()}`;

    return {
      name: `${firstName} ${lastName}`,
      email,
      merchantName,
      branchName,
    };
  }

  async clean() {
    const user = await this.prisma.user.deleteMany();
    const branch = await this.prisma.branch.deleteMany();
    const merchant = await this.prisma.merchant.deleteMany();

    return {
      deleted: {
        user,
        merchant,
        branch,
      },
    };
  }

  /**
   * @description Assuming everything works as expected, this method will create a user, merchant, and branch.
   */
  async methodOne() {
    const { name, email, merchantName, branchName } = this.fakeData();

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
      },
    });

    const merchant = await this.prisma.merchant.create({
      data: {
        name: merchantName,
        branches: {
          createMany: {
            data: [
              {
                name: branchName,
              },
            ],
          },
        },
      },
    });

    return {
      user,
      merchant,
    };
  }

  async methodTwo() {
    console.log('\n\n=== Method Two ===');
    const { name, email, merchantName, branchName } = this.fakeData();

    const result = await this.prisma.$transaction(async (txClient) => {
      const user = await this.methodTwoCreateUser({ email, name }, txClient);
      const merchant = await this.methodTwoCreateMerchant(
        { name: merchantName, branchName },
        txClient,
      );

      return {
        user,
        merchant,
      };
    });

    return result;
  }

  async methodThree() {
    console.log('\n\n=== Method Three ===');
    const { name, email, merchantName, branchName } = this.fakeData();

    const result = await this.prisma.$transaction(async (txClient) => {
      const user = await this.methodTwoCreateUser({ email, name }, txClient);

      console.log(user);
      // NOTE: We throw an error here to simulate a failure in the transaction
      throw new Error('Something went wrong');
      const merchant = await this.methodTwoCreateMerchant(
        { name: merchantName, branchName },
        txClient,
      );

      return {
        user,
        merchant,
      };
    });

    return result;
  }

  private async methodTwoCreateUser(
    { email, name }: { email: string; name: string },
    txClient?: PrismaTransactions,
  ) {
    const client = txClient || this.prisma;

    return client.user.create({
      data: {
        email,
        name,
      },
    });
  }

  private async methodTwoCreateMerchant(
    {
      name,
      branchName,
    }: {
      name: string;
      branchName: string;
    },
    txClient?: PrismaTransactions,
  ) {
    const client = txClient || this.prisma;

    return client.merchant.create({
      data: {
        name,
        branches: {
          createMany: {
            data: [
              {
                name: branchName,
              },
            ],
          },
        },
      },
    });
  }

  @Transactional()
  async clsOne() {
    const { name, email, merchantName, branchName } = this.fakeData();

    const user = await this.txHost.tx.user.create({
      data: {
        email,
        name,
      },
    });

    const merchant = await this.txHost.tx.merchant.create({
      data: {
        name: merchantName,
      },
    });

    throw new Error('Something went wrong');
  }

  @Transactional()
  async clsTwo() {
    const { name, email, merchantName, branchName } = this.fakeData();

    const user = await this.txHost.tx.user.create({
      data: {
        email,
        name,
      },
    });

    const merchant = await this.txHost.tx.merchant.create({
      data: {
        name: merchantName,
      },
    });

    const branch = await this.txHost.tx.branch.create({
      data: {
        name: branchName,
        merchant: {
          connect: {
            id: merchant.id,
          },
        },
      },
    });

    return {
      user,
      merchant: {
        ...merchant,
        braches: [branch],
      },
    };
  }
}
