import Link from 'next/link'
import { Fragment } from "react/jsx-runtime";

export default function Home() {
  return (
    <Fragment>
      <h1 className="text-3xl font-bold">Home Page</h1>
      <Link href="/properties/">Show Properties</Link>
    </Fragment>
  );
}
