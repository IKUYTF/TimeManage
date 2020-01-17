<template>
    <v-layout wrap>
        <v-flex xs4 class="text-xs-center">
            <v-btn round @click="$refs.calendar.prev(), initialize()">
                <v-icon dark left>keyboard_arrow_left</v-icon>
                先月
            </v-btn>
        </v-flex>
        <v-flex xs3 offset-xs1 class="text-xs-center">
            <v-menu ref="menu" v-model="menu"
                    :close-on-content-click="false"
                    :nudge-right="40" :return-value.sync="date"
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
        <v-flex xs4 class="text-xs-center">
            <v-btn round @click="$refs.calendar.next(), initialize()">
                来月
                <v-icon right dark>keyboard_arrow_right</v-icon>
            </v-btn>
        </v-flex>
        <v-flex xs12 class="mb-3">
            <v-sheet height="500">
                <v-calendar ref="calendar" :now="today" :value="date" color="primary"
                            v-model="start" type="month" @click:date="editTime(start)">
                    <template v-slot:day="{ date }">
                        <template v-for="event in eventsMap[date]">
                            <v-menu :key="event.title" v-model="event.open"
                                    full-width offset-x>
                                <template v-slot:activator="{ on }">
                                    <div v-if="!event.time" v-ripple
                                         :class="event.title.indexOf('休み') !== -1 ? 'my-event1' : 'my-event'" v-on="on"
                                         v-html="event.title">
                                    </div>
                                </template>
                                <v-card color="grey lighten-4"
                                        min-width="300px" flat>
                                    <v-toolbar :color="event.title.indexOf('休み') !== -1 ? 'success' : 'primary'" dark class="detail-toolbar">
                                        <v-btn icon @click="editTime(event.date)">
                                            <v-icon>edit</v-icon>
                                        </v-btn>
                                        <v-toolbar-title v-html="event.title"></v-toolbar-title>
                                        <v-btn icon @click="deleteTime(event.date)">
                                            <v-icon>delete</v-icon>
                                        </v-btn>
                                    </v-toolbar>
                                    <v-card-title primary-title>
                                        <span v-html="event.details"></span>
                                    </v-card-title>
                                </v-card>
                            </v-menu>
                        </template>
                    </template>
                </v-calendar>
            </v-sheet>
            <v-dialog v-model="editDialog" max-width="450px">

                <v-card>
                    <v-card-title>
                        <span class="headline">{{editingDate}} 勤務時間</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-container grid-list-xl>
                                <v-layout wrap>
                                    <v-flex xs12 md12>
                                        <v-select :items="workTypes" label="勤務区分" v-model="type"
                                                  prepend-icon="assignment"></v-select>
                                    </v-flex>
                                    <v-flex xs12 md6 v-if="type==='出勤'">
                                        <v-menu ref="timeMenu1" v-model="timeMenu1" :close-on-content-click="false"
                                                :nudge-right="40" :return-value.sync="startTime" lazy
                                                transition="scale-transition" offset-y full-width>
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="startTime" label="出勤時間(9:30予定)"
                                                              prepend-icon="access_time" readonly v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-time-picker v-if="timeMenu1" v-model="startTime" full-width
                                                           :allowed-minutes="allowedStep" class="mt-3" format="24hr">
                                                <v-btn flat color="primary" @click="timeMenu1 = false">Cancel</v-btn>
                                                <v-btn flat color="primary" @click="$refs.timeMenu1.save(startTime)">OK</v-btn>
                                            </v-time-picker>
                                        </v-menu>
                                    </v-flex>
                                    <v-flex xs12 md6 v-if="type==='出勤'">
                                        <v-menu ref="timeMenu2" v-model="timeMenu2" :close-on-content-click="false"
                                                :nudge-right="40" :return-value.sync="endTime" lazy
                                                transition="scale-transition" offset-y
                                                full-width>
                                            <template v-slot:activator="{ on }">
                                                <v-text-field v-model="endTime" label="退勤時間(17:30予定)"
                                                              prepend-icon="access_time" readonly v-on="on">
                                                </v-text-field>
                                            </template>
                                            <v-time-picker v-if="timeMenu2" v-model="endTime" full-width
                                                           :allowed-minutes="allowedStep" class="mt-3" format="24hr">
                                                <v-btn flat color="primary" @click="timeMenu2 = false">Cancel</v-btn>
                                                <v-btn flat color="primary" @click="$refs.timeMenu2.save(endTime)">OK</v-btn>

                                            </v-time-picker>
                                        </v-menu>
                                    </v-flex>

                                    <v-flex xs12 md12 v-if="type!=='出勤'">
                                        <v-text-field label="休み備考" prepend-icon="note" :counter="100"
                                                      v-model="restMemo"></v-text-field>
                                    </v-flex>

                                    <v-flex xs12 md6>
                                        <v-btn :disabled="!valid" color="success" class="btn" @click="save">確認</v-btn>
                                    </v-flex>

                                    <v-flex xs12 md6>
                                        <v-btn color="warning" class="btn" @click="close">キャンセル</v-btn>
                                    </v-flex>

                                </v-layout>
                            </v-container>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-dialog>

            <v-snackbar
                    v-model="snackbar"
                    color='success'
                    top
            >
                {{ alertText }}
                <v-icon dark flat @click="snackbar = false">close</v-icon>
            </v-snackbar>
            <v-dialog v-model="loadingDialog" persistent width="300">
                <v-card color="primary" dark>
                    <v-card-text>
                        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-flex>


    </v-layout>
</template>

<script>
    import qs from 'qs'

    export default {
        data() {
            return {
                date: new Date().toISOString().substr(0, 7),
                menu: false,
                timeMenu1: false,
                timeMenu2: false,
                startTime: '9:30',
                endTime: '17:30',
                defaultStartTime: '9:30',
                defaultEndTime: '17:30',
                dialog: false,
                editDialog: false,
                valid: false,
                type: '出勤',
                workTypes: ['出勤', '休み'],
                restMemo: '',
                today: new Date().toISOString().substr(0, 10),
                events: [],
                monthRecords:[
                ],
                start: new Date().toISOString().substr(0, 7) + '-01',
                editingDate: '',
                localUrl: '',
                snackbar: false,
                alertText: '',
                calendarColor: 'primary',
                loadingDialog: false
            }
        },
        metaInfo: {
            title: '勤怠時間管理'
        },
        computed: {
            // convert the list of events into a map of lists keyed by date
            eventsMap() {
                const map = {};
                this.events.forEach(e => (map[e.date] = map[e.date] || []).push(e))
                this.date = this.start.substr(0, 7);
                return map
            }
        },
        created() {
            this.localUrl = global.backServerEndpoint + '/worktime';
            this.initialize();
        },
        watch: {
            loadingDialog (val) {
                if (!val) return

                setTimeout(() => (this.loadingDialog = false), 6000)
            }
        },
        methods: {
            initialize() {

                this.loadingDialog = true;
                const url = this.localUrl + '/worktime-getAll/' + localStorage.getItem('ms_username')
                + '/' + this.start.substr(0, 7);
                this.$axios({
                    method: 'get',
                    url: url
                }).then((res) => {
                    this.monthRecords = res.data;
                    this.events = [];
                    for(let i = 0; i < this.monthRecords.length; i++) {
                        if(this.monthRecords[i].type === '') {
                            continue;
                        }
                        if(this.monthRecords[i].type === '休み') {
                            let daily = {
                                title: '休み<br/>' + this.monthRecords[i].restMemo,
                                details: this.monthRecords[i].restMemo,
                                date: this.monthRecords[i].date,
                            };
                            this.events.push(daily);
                            continue;
                        }
                        let workCount = this.timeDiff(this.monthRecords[i].startTime, this.monthRecords[i].endTime);
                        workCount = workCount >= 8 ? workCount -= 0.5 : workCount;
                        let passTime = 0;
                        if (workCount > 8.5)
                            passTime = workCount - 7.5;
                        else if(workCount >= 8)
                            passTime = 1;
                        else if(workCount > 7)
                            passTime = workCount - 7;
                        else
                            passTime = 0;
                        let daily = {
                            title: this.monthRecords[i].startTime + '～' +
                                this.monthRecords[i].endTime + '<br/>勤務時間：' +
                                workCount + '時間',
                            details: '出勤時間：' + this.monthRecords[i].startTime +
                                '<br/>退勤時間：' + this.monthRecords[i].endTime +
                                '<br/>超過時間：' + passTime,
                            date: this.monthRecords[i].date,
                        };
                        this.events.push(daily);
                    }
                    this.loadingDialog = false;
                }).catch(function (response) {
                    console.log(response);
                });

            },
            open(event) {
                alert(event.title)
            },
            chooseMonth() {
                this.$refs.menu.save(this.date);
                this.start = this.date + '-01';
                this.initialize();
            },
            editTime(editDate) {
                if(editDate.indexOf(this.date) !== -1) {
                    this.editDialog = true;
                    this.editingDate = editDate;
                    let index = this.searchEditingDate(editDate) === false ? -1 : this.searchEditingDate(editDate);
                    if(index === -1 || this.monthRecords[index].startTime === '' || this.monthRecords[index].endTime === '') {
                        return false;
                    }
                    this.type = this.monthRecords[index].type;
                    this.restMemo = this.monthRecords[index].restMemo;
                    this.startTime = this.monthRecords[index].startTime;
                    this.endTime = this.monthRecords[index].endTime;
                } else {
                    this.initialize();
                }
            },
            deleteTime(deleteDate) {
                if(deleteDate.indexOf(this.date) !== -1) {
                    let url = this.localUrl +  '/worktime-update';
                    let daily = {
                        date: deleteDate,
                        startTime: '',
                        endTime: '',
                        type: '',
                        restMemo: '',
                        user: localStorage.getItem('ms_username')
                    };
                    this.$axios.post(url, qs.stringify(daily)).then(() => {
                        this.snackbar = true;
                        // this.loadingDialog = false;
                        // this.loadingText = '';
                        this.alertText = '勤怠情報削除済み';
                        this.initialize();
                    }).catch(function (response) {
                        console.log(response)
                    });
                } else {
                    this.initialize();
                }
            },
            allowedStep: m => m % 15 === 0,
            save() {
                let index = this.searchEditingDate(this.editingDate) === false ? -1 : this.searchEditingDate(this.editingDate);
                let url = '';
                if(index === -1) {
                    url = this.localUrl + '/worktime-insert';
                }
                else {
                    url = this.localUrl +  '/worktime-update';
                }
                let daily = {
                    date: this.editingDate,
                    startTime: this.startTime,
                    endTime: this.endTime,
                    type: this.type,
                    restMemo: this.restMemo,
                    user: localStorage.getItem('ms_username')
                };
                this.$axios.post(url, qs.stringify(daily)).then(() => {
                    this.snackbar = true;
                    // this.loadingDialog = false;
                    // this.loadingText = '';
                    this.alertText = '勤怠情報更新済み';
                    this.initialize();
                    this.close()
                }).catch(function (response) {
                    console.log(response)
                });
            },
            close() {
                this.startTime = this.defaultStartTime;
                this.endTime = this.defaultEndTime;
                this.editDialog = false;

            },
            timeDiff(start, end) {
                let startTime = parseInt(start.split(':')[0]) + parseFloat(start.split(':')[1]/60);
                let endTime = parseInt(end.split(':')[0]) + parseFloat(end.split(':')[1]/60);
                return endTime-startTime < 0 ? 0 : endTime-startTime;
            },
            searchEditingDate(date) {
                for(let i = 0; i < this.monthRecords.length; i++) {
                    if(this.monthRecords[i].date === date)
                        return i;
                }
                return false;
            }
        }
    }
</script>
<style lang="stylus" scoped>
    .my-event {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-radius: 2px;
        background-color: #1867c0;
        color: #ffffff;
        border: 1px solid #1867c0;
        width: 100%;
        font-size: 12px;
        padding: 3px;
        cursor: pointer;
        margin-bottom: 1px;
    }


    .my-event1 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-radius: 2px;
        background-color: #5cb860;
        color: #ffffff;
        border: 1px solid #5cb860;
        width: 100%;
        font-size: 12px;
        padding: 3px;
        cursor: pointer;
        margin-bottom: 1px;
    }

    .date-field {
        width: 90px;
    }

    .detail-toolbar {
        padding-left: 10px;
    }


    .btn {
        width: 200px;
    }
</style>

