export const state = () => ({
     events:[] // events to fulfill the calendar
})


export const getters = {
    readEvents(state){
        return state.events
    }

}

export const mutations = {
    setEvents(state,events){
        state.events = events
    }
}

export const actions = {
   setEvents(vuexContext){
         this.$axios
        .$get("http://localhost:8000/api/events/",{
            // headers:{ 
            //     'Authorization':`Token ` //add your own token here
            // }
        })
        .then(res => {
            const events = [];
            res.forEach( ev => {
                events.push(ev)                
            });
            vuexContext.commit('setEvents', events)    

        })
        .catch(e => console.log(e))
    }
}


