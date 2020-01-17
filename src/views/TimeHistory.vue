<template>
    <v-layout wrap>
        <v-flex xs3 class="text-xs-center">
            <v-btn round @click="preNextMonth(false)">
                <v-icon dark left>keyboard_arrow_left</v-icon>
                先月
            </v-btn>
        </v-flex>
        <v-flex xs2 offset-xs1 class="text-xs-center">
            <v-menu ref="menu" v-model="menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="date"
                    lazy transition="scale-transition"
                    offset-y full-width max-width="290px" min-width="290px">
                <template v-slot:activator="{ on }">
                    <v-text-field v-model="date" label="今月" class="date-field"
                                  prepend-icon="event" readonly v-on="on">
                    </v-text-field>
                </template>
                <v-date-picker v-model="date" type="month" no-title
                               scrollable @input="chooseMonth">
                    <v-spacer></v-spacer>
                </v-date-picker>
            </v-menu>
        </v-flex>
        <v-flex xs3 class="text-xs-center">
            <v-btn round @click="preNextMonth(true)">
                来月
                <v-icon right dark>keyboard_arrow_right</v-icon>
            </v-btn>
        </v-flex>
        <v-flex xs3 class="text-xs-center">
            <v-btn @click="exportExcel()"
                   :loading="loading"
                   :disabled="loading">
                <v-icon right dark>import_export</v-icon>
                EXCELエクスポート
            </v-btn>
        </v-flex>
        <v-flex xs12>
        <v-data-table :headers="headers" :items="worktime" class="elevation-1"
                      :pagination.sync="pagination" hide-actions>
            <template v-slot:headers="props">
                <tr>
                    <th colspan="3" rowspan="2">{{date}}</th>
                    <th colspan="2">李</th>
                    <th colspan="2">夏</th>
                    <th colspan="2">郁</th>
                    <th colspan="2">池</th>
                    <th colspan="2">李涛</th>
                    <th colspan="2">勝見</th>
                    <th colspan="2">福永</th>
                    <th colspan="2">関谷</th>
                </tr>
                <tr>
                    <th>直接</th>
                    <th>超過</th>
                    <th>直接</th>
                    <th>超過</th>
                    <th>直接</th>
                    <th>超過</th>
                    <th>直接</th>
                    <th>超過</th>
                    <th>直接</th>
                    <th>超過</th>
                    <th>直接</th>
                    <th>超過</th>
                    <th>直接</th>
                    <th>超過</th>
                    <th>直接</th>
                    <th>超過</th>
                </tr>
            </template>
            <template v-slot:items="props">
                <tr :class="(props.item.weekday === '土'|| props.item.weekday === '日') ?'rest-tr': ''">
                <td class="text-xs-center">{{ props.item.date }}</td>
                <td class="text-xs-center">{{ props.item.weekday }}</td>
                <td class="text-xs-center">{{(props.item.weekday === '土'|| props.item.weekday === '日') ? '1' : ''}}</td>
                <td class="text-xs-center">{{ props.item.liDirect }}</td>
                <td class="text-xs-center">{{ props.item.liOvertime }}</td>
                <td class="text-xs-center">{{ props.item.kaDirect }}</td>
                <td class="text-xs-center">{{ props.item.kaOvertime }}</td>
                <td class="text-xs-center">{{ props.item.ikuDirect }}</td>
                <td class="text-xs-center">{{ props.item.ikuOvertime }}</td>
                <td class="text-xs-center">{{ props.item.chiDirect }}</td>
                <td class="text-xs-center">{{ props.item.chiOvertime }}</td>
                <td class="text-xs-center">{{ props.item.litaoDirect }}</td>
                <td class="text-xs-center">{{ props.item.litaoOvertime }}</td>
                <td class="text-xs-center">{{ props.item.kachimiDirect }}</td>
                <td class="text-xs-center">{{ props.item.kachimiOvertime }}</td>
                <td class="text-xs-center">{{ props.item.fukunagaDirect }}</td>
                <td class="text-xs-center">{{ props.item.fukunagaOvertime }}</td>
                <td class="text-xs-center">{{ props.item.sekiyaDirect }}</td>
                <td class="text-xs-center">{{ props.item.sekiyaOvertime }}</td>
                </tr>
            </template>

        </v-data-table>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        data() {
            return {
                headers: [],

                date: new Date().toISOString().substr(0, 7),
                menu: false,
                pagination: {
                    rowsPerPage: -1
                },
                curMonth: '2019-06',
                worktime: [],
                localUrl: '',
                loading: false,
                loader: null,

            }
        },
        metaInfo: {
            title: '勤務履歴'
        },
        methods: {

            initialize() {
                // let curDate = new Date(year + '/' + month + '/' + '01');
                const url = this.localUrl + '/worktime-exportCsv/' + this.date;
                this.$axios({
                    method: 'get',
                    url: url
                }).then((res) => {
                    this.worktime = res.data;
                }).catch(function (response) {
                    console.log(response)
                    // this.loadingDialog = false;
                });
            },
            preNextMonth(ifNextMonth) {
                let monthPlus = ifNextMonth ? 1 : -1;
                let monthInt = parseInt(this.date.substring(5,7));
                let yearInt = parseInt(this.date.substring(0,4));
                monthInt = monthInt + monthPlus;
                if(monthInt > 12) {
                    monthInt = 1;
                    yearInt ++;
                } else if(monthInt < 1) {
                    monthInt = 12;
                    yearInt --;
                }
                if(monthInt < 10) {
                    monthInt = '0' + monthInt;
                }
                this.date = yearInt + '-' + monthInt;
                this.initialize();
            },
            chooseMonth() {
                this.$refs.menu.save(this.date);
                this.initialize();
            },
            exportExcel() {
                this.loader = 'loading';
                require.ensure([], () => {
                    const { export_json_to_excel } = require('../utils/Export2Excel');
                    const tHeader = ['日付', '曜日', '李(直接)', '李(超過)', '夏(直接)', '夏(超過)'
                        , '郁(直接)', '郁(超過)', '池(直接)', '池(超過)', '李涛(直接)', '李涛(超過)'
                        , '勝見(直接)', '勝見(超過)', '福永(直接)', '福永(超過)', '関谷(直接)', '関谷(超過)'];
                    const filterVal = ['date', 'weekday', 'liDirect', 'liOvertime', 'kaDirect', 'kaOvertime'
                        , 'ikuDirect', 'ikuOvertime', 'chiDirect', 'chiOvertime', 'litaoDirect', 'litaoOvertime'
                        , 'kachimiDirect', 'kachimiOvertime', 'fukunagaDirect', 'fukunagaOvertime'
                        , 'sekiyaDirect', 'sekiyaOvertime'];
                    const list = this.worktime;
                    const data = this.formatJson(filterVal, list);
                    export_json_to_excel(tHeader, data, '出勤管理'+this.date);
                })
            },

            formatJson(filterVal, jsonData) {
                return jsonData.map(v => filterVal.map(j => v[j]))
            }
        },

        created() {
            this.localUrl = global.backServerEndpoint + '/worktime';
            this.initialize();

        },
        watch: {
            loader () {
                const l = this.loader;
                this[l] = !this[l];

                setTimeout(() => (this[l] = false), 2000)

                this.loader = null;
            }
        }
    }
</script>
<style>

    .scroll-table {
        overflow-y: scroll;
        height: 700px;
    }

    .rest-tr {
        background: #cecfd0;
    }


    .date-field {
        width: 90px;
    }

    @-moz-keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }
    @-webkit-keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }
    @-o-keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }
    @keyframes loader {
        from {
            transform: rotate(0);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>