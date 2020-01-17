/**
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 */
export default [
    {
        path: '/login',
        name: '登録',
        view: 'Login'
    },
    {
        path: '/timeHistory',
        name: '勤務履歴',
        view: 'TimeHistory'
    },
    {
        path: '/timeManage',
        name: '勤務管理',
        view: 'TimeManage'
    }
]
