import { Sequelize } from 'sequelize';
import { join } from 'path';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: join(__dirname, 'db.sqlite'),
      });

      await sequelize.sync();

      return sequelize;
    },
  },
];
