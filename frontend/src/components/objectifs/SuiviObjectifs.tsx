// src/components/objectifs/SuiviObjectifs.tsx
import React, { useEffect, useState } from 'react';
import { getObjectifs } from '../../api/objectifs';

const SuiviObjectifs: React.FC = () => {
  const [objectifs, setObjectifs] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getObjectifs();
      setObjectifs(data);
    };
    fetch();
  }, []);

  return (
    <div>
      <h3>Suivi des Objectifs</h3>
      {objectifs.map((obj: any) => (
        <div key={obj.id}>
          <p><strong>{obj.libelle}</strong> ({obj.type_kpi})</p>
          <progress value={obj.taux_avancement_total} max={100}></progress>
          <span> {obj.taux_avancement_total}%</span>
        </div>
      ))}
    </div>
  );
};

export default SuiviObjectifs;
