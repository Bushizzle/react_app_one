import React, {PureComponent} from 'react'

class Helpers extends PureComponent  {

    render(){
        return null;
    };

    getDateString = (date) => {

        const month = ['January','February','March','April','May','June','July','August','September','October','November','December'],
            week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

        return `${week[date.getDay()]}, ${month[date.getMonth()]} ${this.getNumberWithSuffix(date.getUTCDate())} ${date.getFullYear()}`;
    };

    getNumberWithSuffix = (n) => {
        const s = ["th","st","nd","rd"],
            v=n%100;

        return n+(s[(v-20)%10]||s[v]||s[0]);
    };

    getNowDateString = () => {
        const now = new Date();
        return `${now.getFullYear()}/${ now.getMonth()}/${now.getDate()}`;
    };

    getTemperature = (mode, temperature) => mode === 'C' ? temperature : Math.round(9/5*temperature + 32);
    getTemperatureString = (mode, temperature) => <span>{this.getTemperature(mode, temperature)}<i className={`wi wi-${mode === 'C' ? 'celsius' : 'fahrenheit'}`}> </i></span>;

}

export default Helpers