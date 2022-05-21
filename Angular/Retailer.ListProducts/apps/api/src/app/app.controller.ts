import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { Category, CategoryDto, Product, ProductDb, ProductDto } from '@challenge/api-interfaces';
import { QueryTypes, Sequelize } from 'sequelize';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private readonly appService: AppService,
    @Inject('SEQUELIZE') private sequelize: Sequelize
  ) {
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/check')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('categories')
  async getCategories(): Promise<Category[]> {
    return this.sequelize.query<Category>('SELECT * FROM categories', {
      type: QueryTypes.SELECT,
      raw: true
      // logging: false,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('categories/:categoryId')
  async deleteCategory(@Param('categoryId') categoryId): Promise<void> {
    await this.sequelize.query('DELETE FROM categories WHERE id=:id', {
      type: QueryTypes.DELETE,
      replacements: { id: +categoryId }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('categories')
  async postCategory(@Body() createDto: CategoryDto): Promise<void> {
    await this.sequelize.query('INSERT INTO categories (name) VALUES (:name)', {
      type: QueryTypes.INSERT,
      replacements: { name: createDto.name }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('categories/:categoryId')
  async putCategory(
    @Param('categoryId') categoryId,
    @Body() createDto: CategoryDto
  ): Promise<void> {
    await this.sequelize.query(
      'UPDATE categories set name=:name WHERE id=:id',
      {
        type: QueryTypes.UPDATE,
        replacements: { id: +categoryId, name: createDto.name }
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('products')
  async getProducts(): Promise<Product[]> {
    return Promise.all([
      this.sequelize.query<ProductDb>('SELECT * FROM products', {
        type: QueryTypes.SELECT,
        raw: true // logging: false,
      }),
      this.getCategories()
    ]).then(([products, categories]) => {
      const categoryMap = categories.reduce<Record<string, Category>>(
        (previousValue, currentValue) => ({
          ...previousValue,
          [currentValue.id]: currentValue
        }),
        {}
      );

      return products.map(({ categoryId, ...rest }) => ({
        ...rest,
        category: categoryId in categoryMap ? categoryMap[categoryId] : null
      }) as unknown as Product);
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('products/:productId')
  async deleteProduct(@Param('productId') productId): Promise<void> {
    await this.sequelize.query('DELETE FROM products WHERE id=:id', {
      type: QueryTypes.DELETE,
      replacements: { id: +productId }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('products')
  async postProduct(@Body() createDto: ProductDto): Promise<void> {
    await this.sequelize.query(`INSERT INTO products (name, price, expirationDate, categoryId)
                                VALUES (:name, :price, :expirationDate, :categoryId)`, {
      type: QueryTypes.INSERT,
      replacements: {
        name: createDto.name,
        price: createDto.price,
        expirationDate: createDto.expirationDate,
        categoryId: createDto.categoryId
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('products/:productId')
  async putProduct(
    @Param('productId') productId,
    @Body() createDto: ProductDto
  ): Promise<void> {
    console.log(createDto);
    await this.sequelize.query(`UPDATE products
                                set name=:name,
                                    price=:price,
                                    expirationDate=:expirationDate,
                                    categoryId=:categoryId
                                WHERE id = :id`, {
      type: QueryTypes.UPDATE,
      replacements: {
        id: +productId,
        name: createDto.name,
        price: createDto.price,
        expirationDate: createDto.expirationDate,
        categoryId: createDto.categoryId
      }
    });
  }
}
