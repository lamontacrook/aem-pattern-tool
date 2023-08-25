import { useState, useEffect } from 'react';
import Card from '../Card';
import './CardList.css';

const CardList = ({ data }) => {
  console.log(data);
  return (
    <div className='cardlist'>
      {data && data.data.cardListList.items[0].card.map((card) => (
        <Card data={card} key={card.title}/>
      ))}
    </div>
  );
};

export default CardList;