export default function validator(data) {
  if (!data) return false;
  try {
    let temp = data;
    if (temp.includes('[')) {
      temp = temp.substr(temp.indexOf('[') + 1);
      temp = temp.substring(temp.indexOf(']'), 0);
    }
    let [lati, long] = temp.split(',');
    lati = lati.trim();
    long = long.trim();
    if (!lati) return false;
    if (!long) return false;
    return { coords: { latitude: lati, longitude: long } };
  } catch (e) {
    return false;
  }
}
