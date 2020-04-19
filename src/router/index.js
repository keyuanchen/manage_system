import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = () => import('components/login/Login')
const Home = () => import('views/home/Home')
const Welcome = () => import('components/Welcome')
const Users = () => import('components/users/Users')
const Rights = () => import('components/rights/Rights')
const Roles = () => import('components/roles/Roles')
const Categories = () => import('components/categories/Categories')
const Params = () => import('components/params/Params')
const Goods = () => import('components/goods/Goods')
const Add = () => import('components/add/Add')
const Orders = () => import('components/orders/Orders')
const Reports = () => import('components/reports/Reports')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: '/home',
        redirect: '/welcome'
      },
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Orders
      },
      {
        path: '/reports',
        component: Reports
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 添加路由导航守卫
// 如果将要访问的组件是login组件,则放行
router.beforeEach((to, from, next) => {
  if (to.path.indexOf('/login') !== -1) {
    return next()
  }
  // 获取唯一的权限认证token
  const token = window.sessionStorage.getItem('token')
  // 访问其他页面
  if (!token) {
    // 强制跳转到login页面
    next('/login')
    return this.$msg.info('请联系管理员获取登录权限')
  }
  // 此时登录成功,放行
  next()
})

export default router
