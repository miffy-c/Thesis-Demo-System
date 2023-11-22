import * as React from 'react';
import { apiCall } from '../helper';
import SPCard from './SPCard';

export default function SPList ({socket}) {
  const [SP, setSP] = React.useState([]);

  React.useEffect(() => {
    async function getData () {
        const data = await apiCall('/sp/list', {}, 'GET');
        setSP(data)
    }
    getData();
  }, [SP]);

  const SPList = SP.map((sp) =>
    <SPCard name={sp.name} rating={sp.rating} email={sp.email} pubKey={sp.pubK} socket={socket}/>
  )
  return (
    <div>
      {SPList}
    </div>
  );
}