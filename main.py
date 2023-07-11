import tinytuya
import time

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Connect to Device
d = tinytuya.OutletDevice(
    dev_id='bf2a99bf55535014979ids',
    address='192.168.1.32',      # Or set to 'Auto' to auto-discover IP address
    local_key='XzdmGPek:LK8=QW.', 
    version=3.3)

d.set_socketPersistent(True)

payload = d.generate_payload(tinytuya.DP_QUERY)
d.send(payload)

#data = d.status() 
#print(int(data['dps']['19'])/10)

@app.route("/api")
def hello():
	power=0
	indoortemp=20
	data = d.receive()
	try:
		power=int(data['dps']['19'])/10
	except:
		pass
	#print(data)
	values = {
		'power': '{}'.format (power),
		'indoor': '{}'.format (indoortemp)
	}
	
	payload = d.generate_payload(tinytuya.HEART_BEAT)
	d.send(payload)
    
	payload = d.generate_payload(tinytuya.DP_QUERY)
	d.send(payload)
    
	payload = d.generate_payload(tinytuya.UPDATEDPS)
	d.send(payload)
	return jsonify(values)

if __name__ == '__main__':
	app.run(debug=True, port=8000, host="0.0.0.0")
