<i18n>
{
  "en": {
    "ASAPDeliveryLabel": "As soon as possible",
    "ScheduledDeliveryLabel": "Delivery to",
    "DateLabel": "Day",
    "TimeLabel": "Time",
    "DayDefault": "Day",
    "HourDefault": "Hour",
    "MinuteDefault": "Minute",
    "NoDelivery": "It is impossible to make a reservation, the error number #1ftpb"
  },
  "ua": {
    "ASAPDeliveryLabel": "На найближчий час",
    "ScheduledDeliveryLabel": "На вказаний час",
    "DateLabel": "Дата",
    "TimeLabel": "Час",
    "DayDefault": "Дата",
    "HourDefault": "Час",
    "MinuteDefault": "Хвилини",
    "NoDelivery": "Неможливо зробити замовлення, номер помилки #1ftpb"
  },
  "ru": {
    "ASAPDeliveryLabel": "Как можно скорее",
    "ScheduledDeliveryLabel": "Ко времени",
    "DateLabel": "День",
    "TimeLabel": "Время",
    "DayDefault": "День",
    "HourDefault": "Час",
    "MinuteDefault": "Минута",
    "NoDelivery": "Невозможно сделать заказ, номер ошибки #1ftpb"
  }
}
</i18n>
 
<template>
<div class="v-deliveryTimeBlock">
    <form id="deliveryTime_form">

        <div v-if="noDelivery">
            {{ $t('deliveryTimeSelect.NoDelivery') }}
        </div>
    <div class="type-delivery mb-3">
        <div 
            class="ASAPDelivery label-50" 
            v-if="restrictions && restrictions.ASAP.EnabledByTerminalSettings === true"
            >
            <input 
                type="radio" 
                name="v-deliveryTimeRadio" 
                v-model="deliveryTimeASAP" 
                v-bind:value="true"
                :disabled="!ASAPEnabled"
                >
            <label class="v-deliveryTimeLabel" v-on:click="deliveryTimeASAP=ASAPEnabled || null">
                <span>{{ $t('deliveryTimeSelect.ASAPDeliveryLabel') }}</span>
            </label>
        </div>
        
        <div 
            class="ScheduledDelivery label-50" 
            v-if="restrictions && restrictions.Scheduled.EnabledByTerminalSettings === true"
            >
            <input 
                type="radio"
                name="v-deliveryTimeRadio" 
                v-model="deliveryTimeASAP"
                v-bind:value="false"
                :disabled="!ScheduledEnabled"
                >
            <label class="v-deliveryTimeLabel" v-on:click="deliveryTimeASAP=ScheduledEnabled ? false : null">
                {{ $t('deliveryTimeSelect.ScheduledDeliveryLabel') }}
            </label>
        </div>
    </div>

        <div v-if="(restrictions && restrictions.Scheduled.EnabledByTerminalSettings === true) || (restrictions && !restrictions.ASAP.AvailableNow)">
            <div class="time-restriction-messages mt-2 mb-2">
                <div v-for="message in uniqueMessages" v-bind:key="message.Text">
                    {{ message.Text }}
                </div>
            </div>

            <div class="row time-selection" v-bind:class="{disabled : deliveryTimeASAP}">
                <div class="col-lg-5 col-sm-5 mb-3">
                    <label class="for-form-control">{{ $t('deliveryTimeSelect.DateLabel') }}</label>
                    <select class="v-day-select form-control" v-model="day" :disabled="!orderTypeSelected" data-validation="select">
                        <option disabled v-bind:value="null">
                            {{ $t('deliveryTimeSelect.DayDefault') }}
                        </option>
                        <option v-for="dayOption in daysOptions" v-bind:key="dayOption.value" v-bind:value="dayOption.value">
                            {{ dayOption.text }}
                        </option>
                    </select>
                </div>

                <div class="col-lg-4 col-sm-4 col-7 mb-3 time-select-dotted">
                    <label class="for-form-control">{{ $t('deliveryTimeSelect.TimeLabel') }}</label>
                    <select class="v-hour-select form-control" v-model="hour" :disabled="!orderTypeSelected" data-validation="select">
                        <option disabled v-bind:value="null">
                            {{ $t('deliveryTimeSelect.HourDefault') }}
                        </option>
                        <option v-for="hourOption in hoursOptions" v-bind:key="hourOption.value" v-bind:value="hourOption.value">
                            {{ hourOption.text }}
                        </option>
                    </select>
                </div>

                <div class="col-lg-3 col-sm-3 col-5 mb-3">
                    <label>&nbsp;</label>
                    <select class="v-minute-select form-control" v-model="minute" :disabled="!orderTypeSelected" data-validation="select">
                        <option disabled v-bind:value="null">
                            {{ $t('deliveryTimeSelect.MinuteDefault') }}
                        </option>
                        <option v-for="minuteOption in minutesOptions" v-bind:key="minuteOption.value" v-bind:value="minuteOption.value">
                            {{ minuteOption.text }}
                        </option>
                    </select>
                </div>
            </div>
        </div>

    </form>
</div>
</template>

<script>

import { fromMillisInZone } from "../dateTimeHelper"
import { OrderType } from '../consts';

function getSelectedDate(restrictions, day) {
    let selectedDate = null;

    if (restrictions == null) {
        return selectedDate;
    }

    for(let dateKey in restrictions.Scheduled.Schedule.Dates) {
        let availableDate = restrictions.Scheduled.Schedule.Dates[dateKey];
        
        if (availableDate.Date == day) {
            selectedDate = availableDate;
        }
    }

    return selectedDate;
}

export default {
    data () {
        return {
            day: null,
            hour: null,
            minute: null,
            updateRestrictionsIntervalId: null
        } 
    },
    computed: {
        /**
         * Returns unique messages to show to a user
         */
        uniqueMessages() {

            let messages = [];
            
            // if there are messages for ASAP
            if (this.restrictions != null && this.restrictions.ASAP != null) {
                for (let message of this.restrictions.ASAP.Messages) {
                    // expect only a few messages so iterate over to check for duplicates 
                    // (it's faster than building an object to get only unique texts)
                    let duplicateFound = messages.some((value) => value.Text === message.Text);

                    if (!duplicateFound) {
                        messages.push(message);
                    }
                }
            }

            // if day is selected and there are messages for it
            if (this.selectedDay != null && this.selectedDay.Messages != null) {
                for (let message of this.selectedDay.Messages) {
                    // expect only a few messages so iterate over to check for duplicates 
                    // (it's faster than building an object to get only unique texts)
                    let duplicateFound = messages.some((value) => value.Text === message.Text);

                    if (!duplicateFound) {
                        messages.push(message);
                    }
                }
            }
            
            return messages;
        },
        ASAPEnabled() {
            return this.restrictions && 
                this.restrictions.ASAP.AvailableNow && 
                this.orderTypeSelected;
        },
        ScheduledEnabled() {
            return this.restrictions && 
                this.orderTypeSelected;
        },
        orderTypeSelected() {
            return this.$store.state.clientState.orderType != OrderType.Default;
        },
        deliveryTimeASAP: {
            get() {
                let clientStateStore = this.$store.state.clientState;

                if (this.ASAPEnabled && clientStateStore.deliveryTime.ASAP) {
                    return clientStateStore.deliveryTime.ASAP;
                } else if (this.ScheduledEnabled && clientStateStore.deliveryTime.ASAP === false) {
                    return clientStateStore.deliveryTime.ASAP;
                } else {
                    return null;
                }
            },
            set(value) {
                this.$store.dispatch({
                    type: 'cart/selectDeliveryTime',
                    ASAP: value
                });
            }
        },
        restrictions() {
            if (this.$store.state.clientState.timeRestrictions == null) {
                throw new Error('store is not mocked properly');
            }
            return this.$store.state.clientState.timeRestrictions.data;
        },
        restaurantUtcOffset() {
            return this.$store.state.restaurantSettings.data?.GMT;
        },
        selectedDay() {
            return getSelectedDate(this.restrictions, this.day);
        },
        // TODO: uncomment code below if you know how to make tests work with mapState
        // ...mapState('cart', {
        //     restrictions: (state) => state.timeRestrictions.data
        // }),
        daysOptions() {
            let daysOptions = []; 
            
            if (this.restrictions == null) {
                return daysOptions;
            }

            if (this.restaurantUtcOffset == null) {
                return daysOptions;
            }

            for(let dateKey in this.restrictions.Scheduled.Schedule.Dates) {
                let availableDate = this.restrictions.Scheduled.Schedule.Dates[dateKey];

                let availableDT = fromMillisInZone(availableDate.Date, this.restaurantUtcOffset);
                let optionText = availableDT.toLocaleString({ month: 'long', day: '2-digit' });
                
                daysOptions.push({
                    text: optionText,
                    value: availableDate.Date
                });
            }

            return daysOptions;
        },
        hoursOptions() {
            let hoursOptions = [];
            
            let selectedDate = getSelectedDate(this.restrictions, this.day);

            if (selectedDate == null) {
                return null;
            }

            for(let period of selectedDate.RestrictedPeriods) {
              let hoursIterator = fromMillisInZone(period.Start, this.restaurantUtcOffset);

              let minutesStep = this.$store.state.clientState.deliveryTime.minutesStep;

              while(hoursIterator < period.End) {
                if (60 - hoursIterator.minute > minutesStep) {
                  hoursOptions.push({
                    text: hoursIterator.startOf('hour').toFormat('HH'),
                    value: hoursIterator.startOf('hour').valueOf() - selectedDate.Date,
                    period: period
                  });
                }
                // every hour option must point to start of an hour for correct minutes generation
                hoursIterator = hoursIterator.startOf('hour').plus({ hours: 1 });
              }
            }

            return hoursOptions;
        },
        minutesOptions() {
            if (this.hour == null) {
                return null;
            }

            let selectedDate = getSelectedDate(this.restrictions, this.day);
            

            const hourTimestamp = this.hour;

            // get selected period
            let selectedPeriod = null;

            for(let period of selectedDate.RestrictedPeriods) {
                if (selectedPeriod == null || 
                    (period.Start - hourTimestamp) < (selectedPeriod.Start - hourTimestamp)
                ) {
                    selectedPeriod = period;
                }
            }



            // const hourTimestamp = this.hour.value;

            // // get selected period
            // let selectedPeriod = this.hour.period;

            // // for(let period of selectedDate.RestrictedPeriods) {
            // //     if (period.Start <= this.hour && this.hour <= period.End) {
            // //         selectedPeriod = period;
            // //     }
            // // }

            if (selectedPeriod == null) {
                console.warn(`Can\'t get selected period for ${hourTimestamp}`);
                return null;
            }

            let minutesOptions = [];
            const periodStartHour = selectedPeriod.Start - selectedDate.Date;
            let startTimestamp = Math.max(hourTimestamp, periodStartHour);
            let minutesStep = this.$store.state.clientState.deliveryTime.minutesStep;

            let start = fromMillisInZone(startTimestamp, this.restaurantUtcOffset);

            // add minutes to start from minutes that evenly divisible by minutesStep
            // it could be a problem in case if period is smaller than minutesStep * 2 (don't do it)
            const minutesStepRemainder = start.minute % minutesStep;
            const minutesToAddToFit = minutesStepRemainder == 0 ? 0 : (minutesStep - minutesStepRemainder);
            start = start.plus({ minutes: minutesToAddToFit }).startOf('minute');

            // take end of an hour to avoid showing 00 minutes from the next hour
            let nextHour = start.plus({ hours: 1}).startOf('hour').plus({ minutes: -1 }); 
            
            let end = nextHour;
            if (selectedPeriod.End < nextHour) {
                end = selectedPeriod.End;
            }

            let minutesIterator = start; 
            while(minutesIterator <= end) {
                minutesOptions.push({
                    text: minutesIterator.toFormat('mm'),
                    value: minutesIterator.valueOf() - hourTimestamp
                });

                minutesIterator = minutesIterator.plus({minutes: minutesStep});
            }

            return minutesOptions;
        },
        
        noDelivery() {
            return this.restrictions && 
                this.restrictions.ASAP.EnabledByTerminalSettings === false && 
                this.restrictions.Scheduled.EnabledByTerminalSettings === false;
        }
    },
    watch: {
        day(val) {
            this.$store.dispatch({
                type: 'clientState/selectDeliveryTime',
                timestamp: val + this.hour + this.minutes
            });
        },
        hour(val) {
            this.$store.dispatch({
                type: 'clientState/selectDeliveryTime',
                timestamp: this.day + val + this.minutes
            });
        },
        minute(val) {
            this.$store.dispatch({
                type: 'clientState/selectDeliveryTime',
                timestamp: this.day + this.hour + val
            });
        }
    },
    mounted() {
        this.$store.dispatch('loadTimeCorrection');
        this.$store.dispatch('initRestaurantSettings');

        // update time restrictions periodically to avoid orders in the past
        // TODO: select closest option if a selected option is not available anymore
        const updIterval = this.$store.state.clientState.timeRestrictions.minUpdatePeriod;
        this.updateRestrictionsIntervalId = setInterval(() => {
            this.$store.dispatch('clientState/reloadTimeRestrictions')
        }, updIterval);
    },
    beforeUnmount() {
        if (this.updateRestrictionsIntervalId) {
            clearTimeout(this.updateRestrictionsIntervalId);
            this.updateRestrictionsIntervalId = null;
        }
    }
}
</script>