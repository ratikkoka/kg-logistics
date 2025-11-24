import axios from 'axios';

import { validate, sanitize, getRegion, getMake, getYear } from './lib';
import { uri, action, format } from './lib/nhtsa.js';

class Vindec {
  constructor(_vin, _callback) {
    this.vin = '';
    this.callback = () => {};
    this.vindecated = {};
  }
  validate(vin) {
    return validate(vin);
  }
  decode(vin, _callback) {
    return this.validate(vin)
      ? sanitize({
          vin: vin,
          valid: true,
          wmi: vin.slice(0, 3),
          vds: vin.slice(3, 8),
          checkDigit: vin.slice(8, 9),
          vis: vin.slice(9, 17),
          region: getRegion(vin.slice(0, 2)),
          make: getMake(vin.slice(0, 3)),
          year: getYear(vin.slice(6, 7), vin.slice(9, 10)),
          sequence_id: vin.slice(11, 17),
        })
      : { vin: vin, valid: false };
  }
  async nhtsa(vin) {
    let url = `${uri}${action}${vin}${format.json}`;

    return axios.get(url);
  }
}

export default Vindec;
