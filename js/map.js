mapboxgl.accessToken =
	"pk.eyJ1Ijoic3RlcGhlbnNvbi1oZXJpdGFnZSIsImEiOiJjanZ4ejlxazMwYWRlNDhrOHJxN2hlZGl5In0.GvwpDRkNHQKPfS8S2SA4Dg";

const geoIp =
	"https://api.ipgeolocation.io/ipgeo?apiKey=c461a284199842f893dc5ec8561c9a7a";

const geocodeURI = address => {
	return (
		"https://api.opencagedata.com/geocode/v1/json?q=" +
		address +
		"&key=e56256f1a360434bac0898473197dd36"
	);
};

let map = null;
let locInfo = null;
let loading = null;

const centerOnUser = async () => {
	if (map !== null) {
		let mapInfo = await fetch(geoIp);
		let mapInfoJSON = await mapInfo.json();

		let loc = [mapInfoJSON.longitude, mapInfoJSON.latitude];
		map.easeTo({ center: loc });

		return mapInfoJSON;
	}
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1); // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}

let data = null;
let dataJson = null;
function YourChangeFun(ddl) {
	map.flyTo({
		center: [
			dataJson.features[ddl.selectedIndex - 1].geometry.coordinates[0],
			dataJson.features[ddl.selectedIndex - 1].geometry.coordinates[1]
		],
		zoom: 12,
		speed: 1
	});
}
document.addEventListener("DOMContentLoaded", async () => {
	loading = document.getElementById("loading");

	map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/stephenson-heritage/cjvxzf5s96jcy1cmptnuxdskv",
		center: [-75.67273468814251, 45.38968954429647],
		zoom: 9
	});

	locInfo = await centerOnUser();

	data = await fetch("http://localhost:9000/getMuseums");
	dataJson = await data.json();

	//console.log(dataJson);

	const drop = document.getElementById("drplist");

	dataJson.features.forEach(e => {
		// Create an Option object
		var opt = document.createElement("option");
		// Assign text and value to Option object
		opt.text = e.properties.NAME;
		//	opt.value = i;
		// Add an Option object to Drop Down List Box
		document.getElementById("drplist").options.add(opt);

		console.log(locInfo.latitude, locInfo.longitude);
		let distance = getDistanceFromLatLonInKm(
			e.geometry.coordinates[1],
			e.geometry.coordinates[0],
			locInfo.latitude,
			locInfo.longitude
		);
		let link =
			"<a href=link.html#" + e.properties.NAME.replace(/\s/g, "") + ">Link</a>";
		var popup = new mapboxgl.Popup({ offset: 25 }).setText(
			"Construction on the Washington Monument began in 1848."
		);
		let userMarker = new mapboxgl.Marker()
			//.preventDefault()
			.setLngLat([e.geometry.coordinates[0], e.geometry.coordinates[1]])
			.setPopup(
				new mapboxgl.Popup().setHTML(
					"<h4>Name:  " +
						e.properties.NAME +
						" </h4>" +
						"<h4>Address: " +
						e.properties.ADDRESS +
						" </h4>" +
						"<h4>Telephone: " +
						e.properties.TELEPHONE +
						" </h4>" +
						"<h4>Distance: " +
						distance +
						" km</h4>" +
						"<h4>" +
						link +
						"</h4>"
				)
			)
			.addTo(map);
		//.togglePopup();
	});
});
