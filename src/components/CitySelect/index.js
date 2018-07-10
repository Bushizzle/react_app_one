import React, {PureComponent} from 'react'

import PlacesAutocomplete from 'react-places-autocomplete'
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete'

import './style.css'

class CitySelect extends PureComponent {

    render() {

        return (
            <PlacesAutocomplete
                value={this.props.address}
                onChange={this.citySelectChange}
                onSelect={this.citySelectAccept}
                searchOptions={{ types: ['(cities)'] }}
            >
                {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                    <div>
                        <input
                            {...getInputProps({
                                placeholder: this.props.placeholder,
                                className: 'WW_autocomplete-input',
                                onFocus: ()=>{this.props.updateParent({placeholder:''})},
                                onBlur: ()=>{this.props.updateParent({placeholder:'City'})}
                            })}
                        />
                        <div className="WW_autocomplete-drop">
                            {suggestions.map(suggestion => {

                                const className = suggestion.active ? 'WW_autocomplete-drop_item WW_autocomplete-drop_item__active' : 'WW_autocomplete-drop_item';

                                return (
                                    <div {...getSuggestionItemProps(suggestion, { className })}>
                                        <span>{suggestion.description}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </PlacesAutocomplete>
        )
    }

    citySelectChange = address => this.props.updateParent({ address });

    citySelectAccept = address => {

        geocodeByAddress(address)
            .then(results => getLatLng(results[0]))
            .then(position => {

                const addressArr = address.split(', ');
                const city = addressArr[0];
                const country = addressArr[addressArr.length - 1];
                const weatherAppPosition = {
                    ...position,
                    city,
                    country
                };

                localStorage.setItem('weatherAppPosition', JSON.stringify(weatherAppPosition));

                this.props.updateParent(weatherAppPosition);

                this.props.requestAppData(position);
            })
            .catch(error => console.error('Error', error))

    };

}

export default CitySelect