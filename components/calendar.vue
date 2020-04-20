<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">

          <!-- button to add a new event to the calendar -->
          <v-btn color="primary" dark @click.stop="dialog = true" class="mr-4">
            New Event
          </v-btn>
          <!-- end of button to add a new event to the calendar -->


          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            Today
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn
                outlined
                color="grey darken-2"
                v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>

      <!-- dialog form to add a new event -->
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
           <v-form @submit.prevent="addEvent">
             <v-container>
              <v-text-field v-model="name" type="text" label="event name (required)"></v-text-field>
              <v-text-field v-model="color" type="color" label="color (click to open color menu)"></v-text-field>
              
              <v-row>
                <v-col cols="9">
                  <v-text-field v-model="start" type="date" label="start date (required)"></v-text-field>
                </v-col>
                  
                <v-col cols="3">
                  <v-text-field v-model="start_time" type="time" label="start time"></v-text-field>
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="9">
                  <v-text-field v-model="end" type="date" label="end date (required)"></v-text-field>
                </v-col>
                  
                <v-col cols="3">
                  <v-text-field v-model="end_time" type="time" label="end time"></v-text-field>
                </v-col>
              </v-row>

              <v-text-field v-model="details" type="text" label="detail"></v-text-field>
              
              
              
           
              <v-btn type="submit" color="primary" class="mr-4" @click.stop="dialog = false">
                create event
              </v-btn>
              <v-btn color="primary" class="mr-4" @click.stop="dialog = false">
                close
              </v-btn>
            </v-container>
          </v-form>
          
        </v-card>
      </v-dialog>
      <!-- end of dialog to add a new event -->

      <v-sheet height="600">
       <!-- calendat vue js -->
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :event-margin-bottom="3"
          :now="today"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        ></v-calendar>
        <!-- end calendar vuejs -->

        <!-- menu card of each event -->
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >

          <v-card color="grey lighten-4" min-width="350px" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-btn @click="deleteEvent(selectedEvent.id)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                <div class="flex-grow-1"></div>
              </v-toolbar>
            <v-card-text>
             <form v-if="currentlyEditing !== selectedEvent.id">
                {{ selectedEvent.details }}
             </form>
             <form v-else>
                <textarea
                  value="selectedEvent.details"
                  @input="updateEventDetails"
                  type="text"
                  style="width: 100%"
                  :min-height="100"
                  placeholder="edit event details">
                </textarea>
              </form>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="secondary" @click="closeEvent(selectedEvent)">
                close
              </v-btn>
              <v-btn text v-if="currentlyEditing !== selectedEvent.id"  @click="editEvent(selectedEvent)">
                edit
              </v-btn>
              <v-btn text v-else type="submit" @click.prevent="updateEvent(selectedEvent)">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
        <!-- end menu for the editing cards -->

      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex'

 export default {
    data: () => ({
      today: new Date().toISOString().substr(0, 10),
      focus: new Date().toISOString().substr(0, 10),
      type: 'month',
      typeToLabel: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        '4day': '4 Days',
      },
      name:null,
      details:null,
      start: null,
      end: null,
      start_time:'',
      end_time:'',
      color: '#1976D2', // default color
      currentlyEditing: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      dialog: false,
      
      detailsEdit:null,
           
    }),
    computed: {
      ...mapState([
        'events'
      ]),
      title () {
        const { start, end } = this
        if (!start || !end) {
          return ''
        }

        const startMonth = this.monthFormatter(start)
        const endMonth = this.monthFormatter(end)
        const suffixMonth = startMonth === endMonth ? '' : endMonth

        const startYear = start.year
        const endYear = end.year
        const suffixYear = startYear === endYear ? '' : endYear

        const startDay = start.day + this.nth(start.day)
        const endDay = end.day + this.nth(end.day)

        switch (this.type) {
          case 'month':
            return `${startMonth} ${startYear}`
          case 'week':
          case '4day':
            return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
          case 'day':
            return `${startMonth} ${startDay} ${startYear}`
        }
        return ''
      },
    monthFormatter () {
        return this.$refs.calendar.getFormatter({
          timeZone: 'UTC', month: 'long',
        })
      },
    },
    mounted () {
      this.getEvents()
    },
    methods: {
      getEvents(){
        this.$store.dispatch('setEvents');
      },
      addEvent(){
        // paramaters to create a new event
        if ( this.name && this.start && this.end ){
          const bodyParameters = {
          name:this.name,
          details:this.details,
          start:this.start+" "+this.start_time,
          end:this.end+" "+this.end_time,
          color:this.color
        }
        this.$axios
        .$post("http://localhost:8000/api/events/", bodyParameters,{
          // headers:{
          //       'Authorization':`Token 60e1deea35fc5ef9ed9c53a4dc4f9e8b1163d113`
          //   }
        })
        .then(res => {
         
          this.getEvents()
          this.name = '',
          this.details = '',
          this.start = '',
          this.end = '',
          this.color = ''
        })
        .catch(e => console.log(e))

        }else {
          alert('You must enter event name, start, and end date')
        }
                
      },
      updateEventDetails(ev){
       this.detailsEdit = ev.target.value
              
      },
      deleteEvent(ev){
        this.$axios
        .$delete("http://localhost:8000/api/events/"+ev+"/", {
          // headers:{
          //        'Authorization':`Token 60e1deea35fc5ef9ed9c53a4dc4f9e8b1163d113`
          //    }
        })
        .then(res => {
          this.getEvents()
          this.selectedOpen = false
        })
        .catch(e => console.log(e))

      },
      editEvent(ev){
         this.currentlyEditing = ev.id
      },
      closeEvent(ev){
        this.currentlyEditing = null
        this.selectedOpen = false
      },
      updateEvent(ev){
        const bodyParameters = {
          name:ev.name,
          details:this.detailsEdit,
          start:ev.start,
          end:ev.end,
          color:ev.color
        }
        this.$axios
        .$put("http://localhost:8000/api/v1/events/"+ev.id+"/", bodyParameters,{
          headers:{
                'Authorization':`Token 60e1deea35fc5ef9ed9c53a4dc4f9e8b1163d113`
            }
        })
        .then(res => {
          this.getEvents()
          this.details = '',
          this.detailsEdit='',
          this.selectedOpen = false
          this.currentlyEditing = null
          
        })
        .catch(e => console.log(e))
        
        
      },
      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      getEventColor (event) {
        return event.color
      },
      setToday () {
        this.focus = this.today
      },
      prev () {
        this.$refs.calendar.prev()
      },
      next () {
        this.$refs.calendar.next()
      },
      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          setTimeout(() => this.selectedOpen = true, 10)
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          setTimeout(open, 10)
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },
      updateRange ({ start, end }) {
        this.start = start
        this.end = end
      },
      nth (d) {
        return d > 3 && d < 21
          ? 'th'
          : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
      },
    },
  }
</script>