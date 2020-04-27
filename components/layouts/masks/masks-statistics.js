import React, {useContext, useCallback, useMemo} from 'react'
import PropTypes from 'prop-types'
import {sumBy, groupBy, flatten} from 'lodash'

import regions from '../../../regions.json'
import departements from '../../../departements.json'

import colors from '../../../styles/colors'
import Counter from '../../counter'
import {formatInteger} from '../../../lib/numbers'
import {MasksContext} from '.'

import {ThemeContext} from '../../../pages'

const CompaniesList = ({title, subtitle, companies}) => {
  const themeContext = useContext(ThemeContext)
  return (
    <div className='companies-list'>
      <div className='header'>
        <h3>{title}</h3>
        <h4 className='align-right'>{subtitle}</h4>
      </div>
      <div className='subheader'>
        <div>Entreprises</div>
        <div>Masques produit</div>
      </div>
      <div className='list'>
        {companies.map(({company, masks}) => (
          <div key={company} className='company'>
            <div>{company}</div>
            <div className='align-right'><b>{formatInteger(masks)}</b></div>
          </div>
        ))}
      </div>

      <style jsx>{`
          .companies-list {
            border: 1px solid ${colors.lightGrey};
            border-radius: 4px;
            padding: 1em;
            margin-bottom: 1em;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .subheader {
            margin-bottom: 0.2em;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid ${themeContext.primary};
          }

          .company {
            display: flex;
            justify-content: space-between;
            align-items: center;
            line-height: 1.2em;
            padding: 0.2em 0.1em;
          }

          .company > div {
            flex: 1;
          }

          .company:nth-child(even) {
            background-color: ${colors.lighterGrey};
          }

          .company:nth-child(odd) {
            background-color: ${colors.lightGrey};
          }

          .align-right {
            text-align: right;
          }
        `}</style>
    </div>
  )
}

CompaniesList.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  companies: PropTypes.array.isRequired
}

const NationalStatistics = () => {
  const {masksCommunes} = useContext(MasksContext)
  const allMasks = sumBy(masksCommunes, ({companies}) => sumBy(companies, 'masks'))
  const companiesNb = sumBy(masksCommunes, ({companies}) => companies.length)

  return (
    <div>
      <div className='header'>
        <h3>France</h3>
      </div>
      <div className='counters'>
        <Counter
          value={allMasks}
          label='Nombre total de masque estimés'
          color='darkBlue'
          details='Estimation totale de la production de masque'
        />
        <Counter
          value={companiesNb}
          label='Nombre d’entreprises productrices'
          color='darkBlue'
          details='Entreprises françaises productrices'
        />
      </div>
      <style jsx>{`
        .header {
          text-align: center;
        }

        .counters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          border-bottom: 1px solid ${colors.white};
        }
      `}</style>
    </div>
  )
}

const MasksStatistics = () => {
  const {masksCommunes, selectedRegion, selectedCommune} = useContext(MasksContext)

  const getCompaniesByRegion = useCallback(() => {
    const regionGroup = groupBy(masksCommunes, 'codeRegion')

    return Object.keys(regionGroup).map(code => {
      const communes = regionGroup[code]
      const {region} = regions.find(r => r.code.split('-')[1] === code) || {region: 'International'}
      return {
        code,
        nom: region,
        companies: flatten(communes.map(c => c.companies))
      }
    })
  }, [masksCommunes])

  const getCompaniesByDepartement = useCallback(() => {
    const filteredCommunes = masksCommunes.filter(({codeRegion}) => codeRegion === selectedRegion.code)
    const departementGroup = groupBy(filteredCommunes, 'codeDepartement')

    return Object.keys(departementGroup).map(code => {
      const communes = departementGroup[code]
      const {departement} = departements.find(r => r.codeDepartement === code)
      return {
        code,
        nom: departement,
        companies: flatten(communes.map(c => c.companies))
      }
    })
  }, [masksCommunes, selectedRegion])

  const companiesBy = useMemo(() => {
    if (selectedCommune) {
      return [{
        code: selectedCommune.commune,
        nom: selectedCommune.commune,
        ...selectedCommune
      }]
    }

    if (selectedRegion) {
      return getCompaniesByDepartement()
    }

    return getCompaniesByRegion()
  }, [selectedCommune, selectedRegion, getCompaniesByDepartement, getCompaniesByRegion])

  return (
    <div className='masks-statistics'>
      <div >
        <h3>Production des masques</h3>
        <NationalStatistics />
        {!selectedCommune && (
          <h4>{selectedRegion ? selectedRegion.nom : 'Par régions'}</h4>
        )}
        {companiesBy.map(({code, nom, companies}) => (
          <CompaniesList
            key={code}
            title={nom}
            subtitle={`${formatInteger(sumBy(companies, 'masks'))} masques`}
            companies={companies}
          />
        ))}
      </div>
      <style jsx>{`
        h3 {
          display: flex;
          justify-content: center;
        }

        .masks-statistics {
          margin: 0 0.5em;
        }
      `}</style>
    </div>
  )
}

export default MasksStatistics
