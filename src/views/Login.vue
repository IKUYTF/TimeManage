<template>
    <div class="login-panel">
        <div class="login-title">
            <div class="ths">
                <table>
                    <tbody>
                    <tr>
                        <td class="t">I</td>
                        <td class="h">S</td>
                        <td class="s">I</td>
                        <td class="t">D</td>
                        <!--<td class="h">n</td>-->
                    </tr>
                    </tbody>
                </table>
            </div>
            <div class="ms-title">勤務管理システム</div>
            <v-form ref="form" v-model="valid"  class="ms-content">
                <v-text-field
                        v-model="username"
                        :counter="10"
                        label="ユーザー名"
                        required
                        :rules="usernameRules"
                        :error-messages="errorMessages"
                        @keyup.enter="submit"
                ></v-text-field>
                <v-text-field
                        :append-icon="show3 ? 'visibility_off' : 'visibility'"
                        required
                        :type="show3 ? 'text' : 'password'"
                        label="パスワード"
                        v-model="password"
                        class="input-group--focused"
                        :rules="passwordRules"
                        :error-messages="errorMessages"
                        @click:append="show3 = !show3"
                        @keyup.enter="submit"
                ></v-text-field>

                <div class="login-btn">
                    <v-btn @click="submit">登録</v-btn>
                    <v-btn @click="clear">リセット</v-btn>
                </div>
            </v-form>
        </div>
        <v-snackbar
                v-model="snackbar"
                :timeout="2000"
                :top=true
                color="success"
        >
            正常登録しました。
            <v-btn dark flat @click="snackbar = false">
                Close
            </v-btn>
        </v-snackbar>
    </div>
</template>

<script>

    export default {
        data() {
            return {
                username: '',
                password: '',
                show3: false,
                valid: true,
                snackbar: false,
                errorMessages: '',
                usernameList: ['yutf', 'liqc', 'xiasl', 'litao', 'chixj', 'kachimi', 'fukunaga', 'sekiya'],
                nameList: ['郁　騰飛', '李 慶燦', '夏 首霖', '李　濤', '池　賢傑', '勝見', '福永', '関谷'],
                usernameRules: [
                    v => !!v || 'ユーザー名を入力してください。'
                ],
                passwordRules: [
                    v => !!v || 'パスワードを入力してください。'
                ]
            }
        },
        metaInfo: {
            title: '勤務管理システム'
        },
        methods: {
            submit() {
                if (!this.$refs.form.validate()) {
                    return false;
                }
                for (let i = 0; i < this.usernameList.length; i++) {
                    if(this.username === this.usernameList[i] && this.username === this.password) {
                        this.errorMessages = '';
                        this.snackbar = true;
                        localStorage.setItem('ms_username', this.username);
                        localStorage.setItem('ms_name', this.nameList[i]);
                        this.$router.push('/timeManage');
                        return true;
                    }
                }

                this.errorMessages = 'ユーザー名またはパスワードが違います';

            },
            clear() {
                this.$refs.form.reset();
                this.errorMessages = '';
            }
        },
        created() {

            const role = localStorage.getItem('ms_username');
            if (role) {
                this.$router.push('/timeManage');
            }
        }
    }
</script>

<style>
    .login-panel {
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: url(../assets/img/login-bg.jpg);
        filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale')";
        -moz-background-size: 100% 100%;
        background-size: 100% 100%;
    }

    .ms-title {
        position: relative;
        width: 100%;
        line-height: 50px;
        text-align: center;
        font-size: 20px;
        color: #4f4f6b;
        font-weight: bold;
        border-bottom: 1px solid #ddd;
        padding: 0 0 0 60px;
    }

    .login-title {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 400px;
        margin: -190px 0 0 -175px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.7);
        overflow: hidden;
    }

    .ms-content {
        padding: 10px 50px 10px 50px;
    }

    .login-btn {
        text-align: center;
        /*margin-top: 15px;*/
    }

    .login-btn button {
        color: black !important;
        font-size: 14px;
        margin-left: 10px;
        width: 130px;
    }

    .ths {
        float: left;
        font-size: 3em;
        font-family: 'Tw Cen MT Condensed', serif;
        margin-top: -5px;
        letter-spacing: -3px;
        padding: 0 0 0 40px;
    }

    .ths .t {
        color: #00B0F0;
    }

    .ths .h {
        color: #92D050;
    }

    .ths .s {
        color: #FFC000;
    }
</style>