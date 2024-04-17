module.exports = {
    root: true,
    env: {
        node: true,
    },
    plugins: [
        'vue',
    ],
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'airbnb-base',
    ],
    parserOptions: {
        parser: '@babel/eslint-parser',
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.vue', '.json'],
            },
            'eslint-import-resolver-alias': {
                map: [
                    ['@', './src'],
                ],
            },
        },
    },
    rules: {
        'import/extensions': ['error', 'ignorePackages', {
            js: 'never',
            vue: 'never',
            json: 'never',
        }],
        // 在这里添加你想要关闭的规则
        'no-restricted-syntax': 'off',
        'no-return-await': 'off',
        'import/prefer-default-export': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': ['warn', { commonjs: false }],
        'vue/multi-word-component-names': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        // 禁止使用console
        'no-console': 'off',
        'no-eval': 'off',
        // 类的实例方法可以不用this
        'class-methods-use-this': 'off',
        // 考虑到 语义性 和 可扩展行 方面，允许 if 作为唯一语句出现在 else 代码块中
        'no-lonely-if': 'off',
        // 考虑到允许对 语义性 和 简化代码逻辑思考 带来的好处，允许在 esle 前有 return
        'no-else-return': 'off',
        // 考虑到 for 循环的编码习惯，以及在 for 循环末尾使用 ++ 不会产生空格带来的语义性问题，故允许
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        // 要求 import/first, 但是不要求绝对路径的依赖位于前方（关闭'absolute-first'）
        'import/first': 'error',
        // 有时确实需要在循环中写 await
        'no-await-in-loop': 'off',
        // 还是会用到 hasOwnProperty
        'no-prototype-builtins': 'off',
        // 考虑到某些时候确实没有 default case, 强制写也是冗余
        'default-case': 'warn',
        // foo == null 用于判断 foo 不是 undefined 并且不是 null，比较常用，故允许此写法
        'no-eq-null': 'off',
        // 考虑到 按需加载功能，关闭全局 require 要求
        'global-require': 'off',
        // 参数重新赋值有些是逻辑正常需求
        'no-param-reassign': 'off',
        // case 中可能会进行一些逻辑处理，声明写临时变量
        'no-case-declarations': 'off',
        // 要求过于严格
        'prefer-destructuring': 'off',
        // 当前检查存在问题，会把有意义的 constructor 识别为无意义的 constructor
        'no-useless-constructor': 'off',

        // 禁用特定的属性
        // https://eslint.org/docs/rules/no-restricted-properties
        // 和 airbnb-base 相比，关闭对 Math.pow 的使用限制
        'no-restricted-properties': ['error', {
            object: 'arguments',
            property: 'callee',
            message: 'arguments.callee is deprecated',
        }, {
            object: 'global',
            property: 'isFinite',
            message: 'Please use Number.isFinite instead',
        }, {
            object: 'self',
            property: 'isFinite',
            message: 'Please use Number.isFinite instead',
        }, {
            object: 'window',
            property: 'isFinite',
            message: 'Please use Number.isFinite instead',
        }, {
            object: 'global',
            property: 'isNaN',
            message: 'Please use Number.isNaN instead',
        }, {
            object: 'self',
            property: 'isNaN',
            message: 'Please use Number.isNaN instead',
        }, {
            object: 'window',
            property: 'isNaN',
            message: 'Please use Number.isNaN instead',
        }, {
            property: '__defineGetter__',
            message: 'Please use Object.defineProperty instead.',
        }, {
            property: '__defineSetter__',
            message: 'Please use Object.defineProperty instead.',
        }],

        /* 代码风格问题 */

        // 标识符允许使用下划线
        'no-underscore-dangle': 'off',
        // 使用4个空格缩进
        indent: ['error', 4, { SwitchCase: 1 }],
        // 考虑到大数量的数组的书写需要，允许一行包含多个元素
        'array-element-newline': 'off',
        // 函数内条件的数量
        complexity: 'off',
        // 函数最多可包含表达式的数量
        'max-statements': 'off',
        // 最大语句嵌套的深度
        'max-depth': 'off',
        // 最大函数嵌套的深度
        'max-nested-callbacks': 'off',
        // 函数参数最大数量
        'max-params': 'off',
        // 行最大长度
        'max-len': 'off',
        // 文件行数需要根据实际情况考量
        'max-lines': 'off',
        // 没必要限制函数必须有名字
        'func-names': 'off',
        // 链式调用没必要强制换行
        'newline-per-chained-call': 'off',
    },
};
