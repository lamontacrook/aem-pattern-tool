import { useState, useEffect } from 'react';
import { mapJsonRichText } from '../../utils/renderRichText';

const Card = ({ data }) => {
  const cardName = data.metadata.stringMetadata.map((obj) => {
    if (obj.name === 'title') 
      return obj.value;
  });

  const editorProps = {
    itemID: 'urn:aemconnection:' + data.cf + '/jcr:content/data/master',
    itemType: 'reference',
    itemfilter: 'cf',
    'data-editor-itemlabel': cardName[0],
    'data-editor-behavior': 'component',
  };

  console.log(customRenderOptions(data.asset));

  return (
    <div className='card' {...editorProps} itemScope>
      {data.asset && (
        <img src={`https://publish-p101152-e938206.adobeaemcloud.com/${data.asset.path}`} data-editor-behavior='component' className='card-img-top' alt={data.title} itemProp='asset' itemType='media' />
      )}
      <div className='card-body'>
        <h5 className='card-title' itemProp='title' itemType='text' data-editor-itemlabel='Title'>{data.title}</h5>
        <span className='card-text' itemProp='description' itemType='richtext' data-editor-itemlable='Description'>
          {mapJsonRichText(data.description.json, customRenderOptions(data.references))}
        </span>
        <a href='#' className='btn btn-primary' itemProp='callToAction' itemType='text' data-editor-itemlable='Call To Action Label'>{data.callToAction}</a>
      </div>
    </div>
  )
}

function customRenderOptions(references) {

  const renderReference = {
    // node contains merged properties of the in-line reference and _references object
    'ImageRef': (node) => {
      // when __typename === ImageRef
      return <img src={node._path} alt={'in-line reference'} />
    },
    'AdventureModel': (node) => {
      // when __typename === AdventureModel
      return <Link to={`/adventure:${node.slug}`}>{`${node.title}: ${node.price}`}</Link>;
    }
  };

  return {
    nodeMap: {
      'reference': (node, children) => {

        // variable for reference in _references object
        let reference;

        // asset reference
        if (node.data.path) {
          // find reference based on path
          reference = references.find(ref => ref._path === node.data.path);
        }
        // Fragment Reference
        if (node.data.href) {
          // find in-line reference within _references array based on href and _path properties
          reference = references.find(ref => ref._path === node.data.href);
        }

        // if reference found return render method of it
        return reference ? renderReference[reference.__typename]({ ...reference, ...node }) : null;
      }
    },
  };
}

export default Card;