import React from 'react'
import PropTypes from 'prop-types'

import colors from '../styles/colors'

import Counter from './counter'

const Counters = ({report, previousReport}) => {
  const {casConfirmes, hospitalises, reanimation, deces, decesEhpad, gueris, casPossiblesEhpad, casConfirmesEhpad} = report || {}
  const totalDeces = deces + decesEhpad
  const previousTotalDeces = previousReport.deces + previousReport.decesEhpad
  const details = {
    casConfirmes: 'Nombre cumulé de cas de COVID-19 confirmés par un test positif. <br />Un nouvel indicateur sera bientôt proposé.',
    gueris: 'Nombre cumulé de patients ayant été hospitalisés pour COVID-19 <br />et de retour à domicile en raison de l’amélioration de leur état de santé',
    deces: 'Nombre cumulé de décès de patients hospitalisés pour COVID-19 depuis le 1er mars 2020',
    hospitalises: 'Nombre de patients actuellement hospitalisés pour COVID-19',
    reanimation: ' Nombre de patients actuellement en réanimation ou soins intensifs',
    decesEhpad: 'Nombre cumulé de décès en EHPAD et EMS (établissements médico-sociaux)',
    casConfirmesEhpad: 'Nombre de cas confirmés par test PCR en EHPAD et EMS.<br />Ce chiffre est inclus dans le nombre total de cas cumulés.',
    casPossiblesEhpad: 'Nombre de cas possibles en EHPAD et EMS, présentant des symptômes compatibles avec un diagnostic COVID-19'
  }

  return (
    <div className='stats'>
      <div className='counters'>
        {casConfirmes && <Counter value={casConfirmes} previousValue={previousReport.casConfirmes} label='cas confirmés' details={details.casConfirmes} color='orange' isBig />}
        {decesEhpad && <Counter value={totalDeces} previousValue={previousTotalDeces} label='cumul des décès' details='Cumul des décés' color='red' isBig />}
      </div>
      <div className='title'>Données hospitalières</div>
      <div className='counters'>
        <Counter value={hospitalises} previousValue={previousReport.hospitalises} label='hospitalisations' details={details.hospitalises} color='darkGrey' />
        <Counter value={gueris} previousValue={previousReport.gueris} label='retours à domicile' details={details.gueris} color='green' />
        <Counter value={reanimation} previousValue={previousReport.reanimation} label='en réanimation' details={details.reanimation} color='darkerGrey' />
        <Counter value={deces} previousValue={previousReport.deces} label='décès à l’hôpital' details={details.deces} color='red' />
      </div>
      <div className='title'>Données EHPAD et EMS</div>
      {decesEhpad && <div className='counters'>
        <Counter value={casConfirmesEhpad} previousValue={previousReport.casConfirmesEhpad} label='cas confirmés en EHPAD et EMS' details={details.casConfirmesEhpad} color='darkOrange' />
        <Counter value={casPossiblesEhpad} previousValue={previousReport.casPossiblesEhpad} label='cas probables en EHPAD et EMS' details={details.casPossiblesEhpad} color='orange' />
        <Counter value={decesEhpad} previousValue={previousReport.decesEhpad} label='décès en EHPAD et EMS' details={details.decesEhpad} color='darkRed' />
      </div>}

      <style jsx>{`
        .stats {
          background-color: ${colors.lighterGrey};
        }

        .counters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          border-bottom: 1px solid ${colors.white};
        }

        .title {
          text-align: center;
          font-size: large;
          font-weight: bold;
          padding: .5em;
          margin-top: .5em;
        }
      `}</style>
    </div>
  )
}

Counters.defaultProps = {
  report: {},
  previousReport: {}
}

Counters.propTypes = {
  report: PropTypes.object,
  previousReport: PropTypes.object
}

export default Counters
