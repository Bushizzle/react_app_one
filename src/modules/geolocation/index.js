import {PureComponent} from 'react'

class Geolocation extends PureComponent  {

    render(){
        return null;
    };

    getBrowserGeolocation = () => {

        if (navigator.geolocation) {
            return new Promise(
                (resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject)
            )
        } else {
            return new Promise(
                resolve => resolve({})
            )
        }
    };

    checkSelfPosition = (position) => {

        return new Promise((resolve, reject) => {

            const previousPosition = localStorage.getItem('weatherAppPosition') ? JSON.parse(localStorage.getItem('weatherAppPosition')) : null;

            if(previousPosition){

                this.props.updateParent({...previousPosition});

                resolve( previousPosition );

            }
            else {

                const geocoder = new window.google.maps.Geocoder();
                const latlng = new window.google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                geocoder.geocode({ location: latlng }, (results, status) => {

                    if (status === window.google.maps.GeocoderStatus.OK) {

                        if (results[0]) {

                            const value = results.find(r => r.types.indexOf('administrative_area_level_1') !== -1);
                            const city = value.formatted_address.split(',')[0];
                            const country = value.formatted_address.split(', ')[1];

                            const newPosition = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                                city,
                                country
                            };

                            localStorage.setItem('weatherAppPosition', JSON.stringify(newPosition));

                            this.props.updateParent({ ...newPosition });

                            resolve( newPosition );

                        } else {
                            reject(["address not found", results]);
                        }

                    } else {
                        reject(["request error", status]);
                    }

                });


            }


        })

    };

}

export default Geolocation