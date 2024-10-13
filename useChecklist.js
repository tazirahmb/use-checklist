/* eslint-disable consistent-return */
import React, { useState } from 'react';
import { fromJS, List } from 'immutable';

export default function useChecklist() {
  const [countTotal, setCountTotal] = useState(0);

  const initChecklistData = fromJS({
    selectstate: 'empty', // empty, partlySelected, allSelected,
    isSelectAll: false,
    value: [],
    countTotal: 0,
  });

  function reducer(state, action) {
    const { checklistData, type } = action;
    const checklistId = checklistData.getIn(['value', 0]);

    switch (type) {
      case 'UPDATE_ALL_CHECKLIST_DATA':
        return state.update((item) => {
          switch (item.get('selectstate')) {
            // Jika selectstate value pada reducer adalah empty
            case 'empty':
              if (checklistData.get('countTotal') > 1) {
                return item.merge(
                  fromJS({
                    selectstate: 'partlySelected',
                    isSelectAll: false,
                    value: checklistData.get('value'),
                  })
                );
              }

              return item.merge(
                fromJS({
                  selectstate: 'allSelected',
                  isSelectAll: false,
                  value: checklistData.get('value'),
                })
              );

            // Jika selectstate value pada reducer adalah partlySelected
            case 'partlySelected':
              if (
                checklistId &&
                item.get('value').size === checklistData.get('countTotal') - 1
              ) {
                if (item.get('isSelectAll')) {
                  return item.merge(
                    fromJS({
                      selectstate: 'empty',
                      isSelectAll: false,
                      value: [],
                    })
                  );
                }

                return item.merge(
                  fromJS({
                    selectstate: 'allSelected',
                    isSelectAll: false,
                    value: item.get('value').push(checklistId),
                  })
                );
              }

              if (checklistId && item.get('value').includes(checklistId)) {
                const value = item
                  .get('value')
                  .filterNot((i) => i === checklistId);

                if (item.get('isSelectAll')) {
                  if (value.isEmpty()) {
                    return item.merge(
                      fromJS({
                        selectstate: 'allSelected',
                        isSelectAll: true,
                        value: [],
                      })
                    );
                  }

                  return item.merge(
                    fromJS({
                      selectstate: 'partlySelected',
                      isSelectAll: true,
                      value,
                    })
                  );
                }

                if (value.isEmpty()) {
                  return item.merge(
                    fromJS({
                      selectstate: 'empty',
                      isSelectAll: false,
                      value: [],
                    })
                  );
                }

                return item.merge(
                  fromJS({
                    selectstate: 'partlySelected',
                    isSelectAll: false,
                    value,
                  })
                );
              }

              return item.mergeDeep(checklistData);
            // Jika selectstate value pada reducer adalah allSelected
            case 'allSelected':
              if (checklistId) {
                if (item.get('value').includes(checklistId)) {
                  const value = item
                    .get('value')
                    .filterNot((i) => i === checklistId);

                  if (value.isEmpty()) {
                    return item.merge(
                      fromJS({
                        selectstate: 'empty',
                        isSelectAll: false,
                        value: [],
                      })
                    );
                  }

                  return item.merge(
                    fromJS({
                      selectstate: 'partlySelected',
                      isSelectAll: false,
                      value,
                    })
                  );
                }

                return item.merge(
                  fromJS({
                    selectstate: 'partlySelected',
                    isSelectAll: true,
                    value: item.get('value').push(checklistId),
                  })
                );
              }
          }
        });
      case 'UPDATE_SELECT_STATE_ON_CHECKLIST_DATA':
        return state.update((item) => {
          const value = checklistData.get('value');

          switch (checklistData.get('selectstate')) {
            case 'empty':
              return item.merge(
                fromJS({
                  selectstate: 'empty',
                  isSelectAll: false,
                  value: [],
                })
              );
            case 'allSelected':
              return item.merge(
                fromJS({
                  selectstate: 'allSelected',
                  isSelectAll: true,
                  value,
                })
              );
          }
        });
      case 'RESET_CHECKLIST_DATA':
        return initChecklistData;
      default:
        return state;
    }
  }

  const [checklistState, checklistDispatch] = React.useReducer(
    reducer,
    initChecklistData
  );

  function updateChecklist(name, value) {
    checklistDispatch({
      type: 'UPDATE_ALL_CHECKLIST_DATA',
      checklistData: checklistState
        .set(name, value)
        .set('countTotal', countTotal),
    });
  }

  function resetChecklist() {
    checklistDispatch({ type: 'RESET_CHECKLIST_DATA' });
  }

  const getIsChecked = (value) => checklistState.get('value').includes(value);

  function getChecklistCounter(listName) {
    if (checklistState.get('value').isEmpty()) return '';

    return (
      <b>
        {checklistState.get('value').size} Selected {listName}
      </b>
    );
  }

  function handleValueChange(value) {
    updateChecklist('value', List([value]));
  }

  const getIsCheckedForSelectAll = () =>
    ['allSelected', 'partlySelected'].includes(
      checklistState.get('selectstate')
    );

  function handleSelectAllChange(values) {
    if (getIsCheckedForSelectAll()) {
      checklistDispatch({
        type: 'UPDATE_SELECT_STATE_ON_CHECKLIST_DATA',
        checklistData: checklistState.set('selectstate', 'empty'),
      });
    } else {
      checklistDispatch({
        type: 'UPDATE_SELECT_STATE_ON_CHECKLIST_DATA',
        checklistData: checklistState
          .set('selectstate', 'allSelected')
          .set('value', values)
          .set('countTotal', countTotal),
      });
    }
  }

  const selectState = checklistState.get('selectstate');

  return {
    selectState,
    checklistState,
    updateChecklist,
    resetChecklist,
    getIsChecked,
    getIsCheckedForSelectAll,
    getChecklistCounter,
    setCountTotal,
    handleValueChange,
    handleSelectAllChange,
  };
}
