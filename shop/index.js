const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const app = new Koa();
// app.use(require('koa-static')(__dirname + '/'));
app.use(bodyParser());
// 初始化数据库
const sequelize = require('./util/database');
const User = require('./models/user');
const Product = require('./models/product');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

// 1对1
Cart.belongsTo(User);
User.hasOne(Cart);

// 1对多
Product.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});
User.hasMany(Product);

// 多对多
Cart.belongsToMany(Product, {
    through: CartItem
});
Product.belongsToMany(Cart, {
    through: CartItem
});

// 1对多
Order.belongsTo(User);
User.hasMany(Order);

// 多对多
Order.belongsToMany(Product, {
    through: OrderItem
});
Product.belongsToMany(Order, {
    through: OrderItem
});

// 加载用户
app.use(async (ctx, next) => {
    const user = await User.findByPk(1);
    ctx.user = user;
    await next();
});
// 查询商品列表
router.get('/admin/products', async ctx => {
    const products = await Product.findAll();
    ctx.body = { products };
});
// 新增商品
router.post('/admin/product/add', async ctx => {
    const body = ctx.request.body;
    await ctx.user.createProduct(body);
    ctx.body = { code: 0, message: 'success' };
});
// 删除商品
router.delete('/admin/product/:id', async ctx => {
    const id = ctx.params.id;
    await Product.destroy({ where: { id } });
    ctx.body = { code: 0, message: 'success' };
});
// 查询购物车里的商品列表
router.get('/cart/products', async ctx => {
    const cart = await ctx.user.getCart();
    const products = await cart.getProducts();
    ctx.body = { products };
});
// 添加购物车里的商品
router.post('/cart/add', async ctx => {
    const body = ctx.request.body;
    const productId = body.productId;
    let newQty = 1;
    // 获取购物车
    const cart = await ctx.user.getCart();
    // 获取购物车里当前要添加的商品
    const products = await cart.getProducts({ where: { id: productId } });

    let product
    if (products.length > 0) {
        // 如果购物车里已经有该商品，则修改数量
        product = products[0]
        console.log('购物车里原有的该商品---', product.get());
        console.log('cartItem----', product.cartItem.get());
        const oldQty = product.cartItem.quantity;
        newQty = oldQty + 1;
    } else {
        // 购物车里还没有该商品，从商品列表里查询
        product = await Product.findByPk(productId);
        console.log('商品列表里取出的商品---', product.get());
    }
    await cart.addProduct(product, {
        through: {
            quantity: newQty
        }
    });
    ctx.body = { code: 0, message: 'success' };
});
// 删除购物车里的商品
router.delete('/cartItem/:id', async ctx => {
    const id = ctx.params.id;
    const cart = await ctx.user.getCart();
    const products = await cart.getProducts({ where: { id } });
    const product = products[0];
    await product.cartItem.destroy();
    ctx.body = { code: 0, message: 'success' };
})

// 生成订单 
router.post('/orders/add', async ctx => {
    const cart = await ctx.user.getCart();
    const products = await cart.getProducts();
    const order = await ctx.user.createOrder();
    await order.addProducts(
        products.map(item => {
            item.orderItem = {
                quantity: item.cartItem.quantity
            };
            return item;
        })
    );
    await cart.setProducts(null);
    ctx.body = { code: 0, message: 'success' };
});
// 查询订单
router.get('/order', async ctx => {
    const orders = await ctx.user.getOrders({
        // include: ['product'],
        order: ['createdAt']
    });
    ctx.body = orders;
})

app.use(router.routes());

// 同步数据
sequelize.sync({ force: false }).then(
    async () => {
        let user = await User.findByPk(1);
        if (!user) {
            user = await User.create({
                name: 'Sourav',
                phone: '13232239288'
            });
            await user.createCart();
        }
        app.listen(3000, () => console.log('Listening to port 3000'));
    }
)