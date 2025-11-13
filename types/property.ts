export interface Property {
  _id: string;
  type: string;
  name: string;
  images: string[];
  beds: number;
  baths: number;
  square_feet: number;
  rates: {
    nightly?: number;
    weekly?: number;
    monthly?: number;
  };
  location: {
    city: string;
    state: string;
  };
}
