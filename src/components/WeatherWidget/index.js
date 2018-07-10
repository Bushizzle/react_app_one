import React, {PureComponent} from 'react'

import iconsDictionary from '../../icons.dictionary'

import Helpers from '../../modules/helpers'
import Geolocation from '../../modules/geolocation'

import Row from '../WwRow'
import Cell from '../WwCell'

import TemperatureSwitcher from '../TemperatureSwitcher'
import CitySelect from '../CitySelect'
import CurrentPosition from '../CurrentPosition'

import LoadingOverlay from '../LoadingOverlay'

import './style.css';


class WeatherWidget extends PureComponent {

    state = {

        city: null,
        country: null,

        startDate: null,
        weather: null,

        currentDayNumber: null,
        currentDaytimeNumber: null,

        daysNumber: 5,
        geolocation: true,

        citySelect: true,
        address: '',
        placeholder: 'City',

        loading: false
    };

    componentWillMount() {

        this.helpers = new Helpers();

        this.geolocation = new Geolocation({
            updateParent: this.stateUpdater
        });

        let appState = {
            currentDaytimeNumber: Math.floor((new Date()).getHours()/3)
        };

        if(localStorage.getItem('weatherAppTemperatureMode')){
            appState.temperatureMode = localStorage.getItem('weatherAppTemperatureMode');
        }

        this.setState(appState);

        this.setPeriodEndTimer();
        this.setDayEndTimer();

        this.initApp();

    };

    render() {

        const weather = this.state.weather;

        const today = weather && weather[this.state.currentDayNumber],
            now = new Date(),
            nowHours = Math.floor(now.getHours()/3);

        const currentDescription = weather && today.description;
        const currentTemp = weather && today.weather.byHours[nowHours].temp;
        const currentIcon = weather && iconsDictionary[today.weather.byHours[nowHours].icon];

        const weatherList = weather && weather
            .map(daily =>
                <Cell key = { Math.random().toString(36).substr(2, 9) } addClass="daily">

                    <span className="WW_daily-weekday">{daily.weekDay}</span>

                    <i className = { `WW_daily-icon wi ${iconsDictionary[daily.weather.byHours[4].icon]}` }> </i>

                    <span className="WW_daily-temp">{this.helpers.getTemperatureString(this.state.temperatureMode, daily.weather.byDaytimes[2])}</span>

                </Cell>);

        const daytimes = ['Night', 'Morning', 'Day', 'Evening'];
        const weatherDuringTheDay = today && today.weather.byDaytimes.map((t, i) =>
            <div key = { Math.random().toString(36).substr(2, 9) } className="WW__during-the-day_row">
                <span className="WW__during-the-day_name">{daytimes[i]}</span>
                <span className="WW__during-the-day_temp">
                    {this.helpers.getTemperatureString(this.state.temperatureMode, t)}
                </span>
            </div>
        );

        if(weatherDuringTheDay)weatherDuringTheDay.push(weatherDuringTheDay.shift());

        return (
            <div className="WW">

                <div className={`WW_table${!this.state.citySelect ? ' WW_table__active' : ''}`}>

                    <Row addClass="justify">

                        <Cell addClass="city">

                            <button className="WW_city-change" onClick={this.citySelectShow.bind(this)}> </button>

                            <span className="WW_city-name">{this.state.city}</span>
                            <span className="WW_city-name">({this.state.country})</span>

                        </Cell>

                        <Cell addClass="switcher">

                            <TemperatureSwitcher temperatureMode={this.state.temperatureMode} updateParent={this.stateUpdater.bind(this)} />

                        </Cell>

                    </Row>

                    <Row>

                        <Cell>

                            <span className="WW_date-string">
                                {this.helpers.getDateString(new Date())}
                            </span>

                        </Cell>

                    </Row>

                    <Row>

                        <Cell>
                            <span className="WW_weather-description">
                                {currentDescription}
                            </span>
                        </Cell>

                    </Row>

                    <Row>

                        <Cell addClass="degrees">
                            <i className = { `WW_daily-icon WW_daily-icon_mobile wi ${currentIcon}` } > </i>
                            {this.helpers.getTemperatureString(this.state.temperatureMode, currentTemp)}
                        </Cell>

                        <Cell addClass="weather-icon">
                            <i className = { `WW_daily-icon wi ${currentIcon}` } > </i>

                        </Cell>

                        <Cell addClass="during-the-day">
                            {weatherDuringTheDay}
                        </Cell>

                    </Row>

                    <Row addClass="justify scroll">
                        {weatherList}
                    </Row>

                </div>

                <div className={`WW_overlay${this.state.citySelect ? ' WW_overlay__active' : ''}`}>

                    <button
                        onClick={ ()=>{this.setState({citySelect: false})} }
                        className={ `WW_overlay_return ${!this.state.city ? ' hidden' : ''}` }
                        > </button>

                    <div className="WW_overlay_city">

                        <CitySelect address={this.state.address} placeholder={this.state.placeholder} updateParent={this.stateUpdater.bind(this)} requestAppData={this.requestAppData.bind(this)} />

                        {this.state.geolocation ? <div className="WW_overlay_current-position"><span>or</span><span>use my <CurrentPosition resetParent={this.initApp.bind(this)} /></span></div> : ''}

                    </div>

                </div>

                {this.state.loading ? <LoadingOverlay /> : ''}

            </div>
        )
    }

    citySelectShow = () => {
        this.setState({
            citySelect: true,
            address: ''
        });

    };



    initApp = () => {

        this.setState({loading: true});

        this.geolocation.getBrowserGeolocation()
            .then(
                position => this.geolocation.checkSelfPosition(position)
            )
            .then(
                position => this.loadWeatherData(position),
                err => {
                    console.warn('Geolocation disabled', err);

                    this.setState({
                        geolocation: false
                    });

                    this.loadWeatherData();
                }
            );

    };

    loadWeatherData = (position) => {

        const weatherAppData = localStorage.getItem('weatherAppData') ? JSON.parse(localStorage.getItem('weatherAppData')) : null,
            weatherAppPosition = localStorage.getItem('weatherAppPosition') ? JSON.parse(localStorage.getItem('weatherAppPosition')) : null;

        if(weatherAppData && weatherAppPosition && weatherAppData.startDate === this.helpers.getNowDateString()){

            this.startApp({
                ...weatherAppData,
                ...weatherAppPosition
            });

        }
        else {

            if(position) this.requestAppData(position);

        }

    };

    requestAppData = (position) => {

        if(!this.state.loading) this.setState({loading: true});

        new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();

            // xhr.open('GET', `http://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${this.props.apiKeys.openWeatherMaps}`, true);
            xhr.open('GET', `https://api.openweathermap.org/data/2.5/forecast?lat=${position.lat}&lon=${position.lng}&APPID=${this.props.apiKeys.openWeatherMaps}`, true);

            xhr.onload = function() {
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    const error = new Error(this.statusText);
                    error.code = this.status;
                    reject(error);
                }
            };

            xhr.onerror = () => {
                reject(new Error("Network Error"));
            };

            xhr.send();

        }).then(
            response => {

                const weatherAppData = this.parseAppData(JSON.parse(response));

                localStorage.setItem('weatherAppData', JSON.stringify(weatherAppData));

                this.startApp({
                    ...weatherAppData,
                    citySelect: false
                });

            },
            error => console.log(error)
        );
    };

    parseAppData = (raw_data) => {

        const week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            todayWeekDayNumber = (new Date()).getDay();

        const weatherByDays = raw_data.list

            // get 20 periods [ [0,1,2], ...etc ]
            .reduce((periods, item, i) => {

                periods[periods.length-1].push(item);

                if(!(i%2) && i) periods.push([item]);

                return periods;

            }, [[]])

            // get this.state.daysNum days [ [night,morning,day,evening] , ...etc ]
            .reduce((days, item, i, arr) => {

                days[days.length-1].push(item);

                if(!((i+1)%(this.state.daysNumber-1)) && i !== arr.length-1) days.push([]);

                return days;

            }, [[]])

            // get days data objects
            .map((day, dayIndex) => {

                const currentWeekDay = (todayWeekDayNumber + dayIndex)%7;
                const currentDescription = day[2][0].weather[0].description;

                const dayData = {

                    weather: {
                        byDaytimes: [0,0,0,0],
                        byHours: []
                    },
                    description: currentDescription[0].toUpperCase() + currentDescription.substr(1),
                    weekDay: week[currentWeekDay]


                };



                day.forEach((daytime, dayTimeIndex) => {

                    let daytimeTemp = 0;

                    daytime.forEach((threeHours, i) => {

                        const tempInC = Math.round(threeHours.main.temp - 273.15);

                        if(i !== 2) dayData.weather.byHours.push({
                            temp: tempInC,
                            icon: threeHours.weather[0].icon
                        });

                        daytimeTemp += tempInC;

                    }, 0);

                    dayData.weather.byDaytimes[dayTimeIndex] = Math.round(daytimeTemp/3);

                });

                return dayData;

            });

        return {

            weather: weatherByDays,
            startDate: this.helpers.getNowDateString(),
            currentDayNumber: 0

        };
    };

    startApp = (data) => {

        // console.log(data);

        this.setState({
            ...data,
            citySelect: false,
            loading: false
        });

    };

    setDayEndTimer = () => {

        const now = new Date();

        setTimeout( () => {

            this.requestAppData(this.state);
            this.setDayEndTimer();

        }, new Date(now.getFullYear(), now.getMonth(), now.getDate()+1) - now);

    };

    setPeriodEndTimer = () => {

        const now = new Date();
        const nowMilliseconds = 24*60*60*1000 - (new Date(now.getFullYear(), now.getMonth(), now.getDate()+1) - now);

        setTimeout(() => {

            this.setState({
                currentDaytimeNumber: this.state.currentDaytimeNumber !== 7 ? this.state.currentDaytimeNumber + 1 : 0
            });

            this.setPeriodEndTimer();

        }, 10800000 - nowMilliseconds % (3*60*60*1000));

    };

    stateUpdater = data => this.setState(data);


}

export default WeatherWidget