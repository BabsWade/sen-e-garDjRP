// src/components/objectifs/ListeObjectifs.tsx
import React, { useEffect, useState } from 'react';
import { getObjectifs } from '../../api/objectifs';

const ListeObjectifs: React.FC = () => {
  const [objectifs, setObjectifs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getObjectifs();
      setObjectifs(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h3>Mes Objectifs</h3>
      <table>
        <thead>
          <tr>
            <th>Libellé</th>
            <th>Type</th>
            <th>Cible</th>
            <th>Poids</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {objectifs.map((obj: any) => (
            <tr key={obj.id}>
              <td>{obj.libelle}</td>
              <td>{obj.type_kpi}</td>
              <td>{obj.cible}</td>
              <td>{obj.poids}</td>
              <td>
                {obj.est_valide ? 'Validé' : obj.est_rejete ? 'Rejeté' : 'En attente'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListeObjectifs;
