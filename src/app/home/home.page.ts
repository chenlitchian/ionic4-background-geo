import { Component } from "@angular/core";
import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
  BackgroundGeolocationEvents
} from "@ionic-native/background-geolocation/ngx";
import { HTTP } from "@ionic-native/http/ngx";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage {
  gps_update_link: string = "replace_with_your_http_request_link";

  constructor(
    private backgroundGeolocation: BackgroundGeolocation,
    private http: HTTP
  ) {}

  startBackgroundGeolocation() {
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 1,
      distanceFilter: 1,
      debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: false // enable this to clear background location settings when the app terminates
    };

    this.backgroundGeolocation.configure(config).then(() => {
      this.backgroundGeolocation
        .on(BackgroundGeolocationEvents.location)
        .subscribe((location: BackgroundGeolocationResponse) => {
          console.log(location);
          this.sendGPS(location);

          // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
          // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
          // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        });
    });

    // start recording location
    this.backgroundGeolocation.start();

    // If you wish to turn OFF background-tracking, call the #stop method.
    this.backgroundGeolocation.stop();
  }

  sendGPS(location) {
    if (location.speed == undefined) {
      location.speed = 0;
    }
    let timestamp = new Date(location.time);

    this.http
      .post(
        this.gps_update_link, // backend api to post
        {
          lat: location.latitude,
          lng: location.longitude,
          speed: location.speed,
          timestamp: timestamp
        },
        {}
      )
      .then(data => {
        console.log(data.status);
        console.log(data.data); // data received by server
        console.log(data.headers);
        this.backgroundGeolocation.finish(); // FOR IOS ONLY
      })
      .catch(error => {
        console.log(error.status);
        console.log(error.error); // error message as string
        console.log(error.headers);
        this.backgroundGeolocation.finish(); // FOR IOS ONLY
      });
  }
}
