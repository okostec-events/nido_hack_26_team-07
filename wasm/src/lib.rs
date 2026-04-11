mod utils;

use wasm_bindgen::prelude::*;
#[wasm_bindgen]
pub fn estimate_arrival_minutes(distance_km: f64, average_speed_kmh: f64) -> f64 {
    if average_speed_kmh <= 0.0 {
        return f64::INFINITY;
    }

    (distance_km / average_speed_kmh) * 60.0
}

#[wasm_bindgen]
pub fn route_difficulty_score(
    elevation_gain_m: u32,
    traffic_events: u32,
    weather_index: f64,
) -> f64 {
    let elevation_component = (elevation_gain_m as f64) / 10.0;
    let traffic_component = (traffic_events as f64) * 4.0;
    let weather_component = weather_index.max(0.0) * 6.5;

    elevation_component + traffic_component + weather_component
}
