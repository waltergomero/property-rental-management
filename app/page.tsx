import Link from 'next/link'
import { Fragment } from "react/jsx-runtime";
import Hero from '@/components/Hero'; 
import InfoBoxes from '@/components/InfoBoxes';

export default function Home() {
  return (
    <Fragment>
      <Hero />
      <InfoBoxes />
    </Fragment>
  );
}
