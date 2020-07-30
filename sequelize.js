(async () => {
    const Sequelize = require('sequelize');
    // 建立连接
    const sequelize = new Sequelize('lqb_sql', 'root', 'root', {
        host: 'localhost',
        dialect: 'mysql',
        // operatorsAliases: false
    })
    // 定义模型
    const Fruit = sequelize.define('Fruit', {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING(20),
            allowNull: false,
            get() {
                const fname = this.getDataValue('name');
                const price = this.getDataValue('price');
                const stock = this.getDataValue('stock');
                return `${fname}（价格：¥${price} 库存：${stock}kg）`
            }
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false,
            validate: {
                isFloat: {
                    msg: '价格字段请输入数字'
                },
                min: {
                    args: [0],
                    msg: '价格字段必须大于0'
                }
            }
        },
        stock: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            validate: {
                isNumeric: {
                    msg: '库存字段请输入数字'
                }
            }
        }
    }, {
        timestamps: false,
        getterMethods:{
            amount(){
                const stock = this.getDataValue('stock');
                const price = this.getDataValue('price');
                return '¥' + stock * price;
            }    
        },
        setterMethods:{
            amount(val){
                const price = this.getDataValue('price');
                this.setDataValue('stock', val / price);
            }
        }
    });
    // 同步数据库，相当于建表，force: true，创建表之前先删除已存在的表
    let ret = await Fruit.sync({ force: false });
    // console.log('sync', ret);
    ret = await Fruit.create({
        name: '香蕉',
        price: 3.5
    });
    // console.log('create', ret);
    ret = await Fruit.findAll();
    // console.log('findAll', JSON.stringify(ret));
    ret[0].stock = 150
    const res = ret.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        stock: item.stock,
        amount: item.amount
    }));

    // ret.forEach((item, index) => {
    //     console.log(index, '-------------', item.get());
    // })

    // 添加类级别方法
    Fruit.classify = name => {
        const tropicFruits = ['香蕉', '芒果', '椰子'];
        return tropicFruits.includes(name) ? '热带水果' : '其他水果';
    };
    // 添加实例级别方法
    Fruit.prototype.totalPrice = function (count) {
        return (this.price * count).toFixed(2);
    };
    // ['香蕉','草莓'].forEach(item => console.log(`${item}是${Fruit.classify(item)}`))
    // ret.forEach(item => console.log(`买5kg${item.name}需要¥${item.totalPrice(5)}`))

    console.log(res[0].id);
    // console.log('findByPrice', JSON.stringify(ret, '', '\t'));
    
    // 通过属性查询首个匹配项
    let ret0 = await Fruit.findOne({
        where: {
            name: '香蕉' 
        }
    });
    // console.log(ret0.get());

    // 指定查询字段
    ret0 = await Fruit.findOne({
        attributes: ['name']
    });
    // console.log(ret0.get());

    // 获取数据和总条数
    let { count } = await Fruit.findAndCountAll();
    // console.log(count);

    const Op = Sequelize.Op;
    // 与条件
    ret = await Fruit.findAll({
        where: {
            price: {
                [Op.lt]: 4,
                [Op.gt]: 2
            }
        }
    })
    // console.log(ret);
    // 或条件
    ret = await Fruit.findAll({
        where: {
            price: {
                [Op.or]: [
                    {
                        [Op.lt]: 3
                    }, {
                        [Op.gt]: 4
                    }
                ]
            }
        }
    });
    // console.log(ret);
    ret = await Fruit.findAll({
        where: {
            [Op.or]: [
                {
                    price: {
                        [Op.gt]: 2,
                        [Op.lt]: 3
                    }
                }, {
                    stock: {
                        [Op.or]: [
                            {
                                [Op.lt]: 50
                            }, {
                                [Op.gte]: 150
                            }
                        ]
                    }
                }
            ]
        }
    });
    // console.log(ret);
    // 分页,从0开始找，找2条
    ret = await Fruit.findAll({
        offset: 0,
        limit: 2
    })
    // ret.forEach(item => {
    //     console.log(item.get());
    // })
    // 排序
    ret = await Fruit.findAll({
        // order: [['price', 'ASC']]
        order: [['price', 'DESC']]
    })
    // ret.forEach(item => {
    //     console.log(item.get());
    // })
    // 聚合
    let max = await Fruit.max('price')
    // console.log(max);
    let sum = await Fruit.sum('stock')
    // console.log(sum);

    // 更新
    await Fruit.findOne({
        where: {
            id: ret[0].id
        }
    }).then(res => {
        res.name = '桃子'
        res.save()
    })

    await Fruit.update({
        stock: ret[0].stock,
        price: 6.1,
    }, {
        where: {
            id: res[0].id
        }
    })

    // 删除
    await Fruit.findOne({ where: { id: ret[0].id } }).then(res => res.destroy())
    await Fruit.destroy({ where: { name: '香蕉' } })
})()