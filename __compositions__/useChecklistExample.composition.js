import React, { useEffect } from 'react';
import '@codex-by-telkom/component-library.helpers.utils.composition-setup';
import useChecklist from '..';
import CheckBox from '@codex-by-telkom/component-library.inputs.check-box';
import Grid from '@codex-by-telkom/component-library.elements.grid';

export function useChecklistExample() {
  const checkListData = [
    {
      label: 'Data 1',
      value: '001',
    },
    {
      label: 'Data 2',
      value: '002',
    },
    {
      label: 'Data 3',
      value: '003',
    },
    {
      label: 'Data 4',
      value: '004',
    },
    {
      label: 'Data 5',
      value: '005',
    },
  ];

  const {
    getIsChecked,
    getIsCheckedForSelectAll,
    getChecklistCounter,
    setCountTotal: setChecklistCountTotal,
    handleValueChange,
    handleSelectAllChange,
    checklistState,
    selectState,
  } = useChecklist();

  useEffect(() => setChecklistCountTotal(checkListData.length), []);

  function _handleSelectAllChange() {
    // pass array of value to the function
    const checkboxValue = checkListData.map(({ value }) => value);

    handleSelectAllChange(checkboxValue);
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <CheckBox
          name="master-check"
          label={
            getIsCheckedForSelectAll() ? getChecklistCounter('Candidates') : ''
          }
          indeterminate={selectState === 'partlySelected'}
          checked={
            (getIsCheckedForSelectAll && getIsCheckedForSelectAll()) ||
            checklistState?.get('value').size > 0
          }
          onChange={_handleSelectAllChange}
        />
      </Grid>
      {checkListData.map((data, idx) => {
        const selected = getIsChecked(data.value);
        return (
          <Grid item key={data.value}>
            <CheckBox
              name={`check-data-${idx + 1}`}
              {...data}
              onChange={() => handleValueChange(data.value)}
              checked={selected}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
