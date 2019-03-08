import React, { useRef, useCallback, useState } from 'react';
import BEMProvider from 'tools/bem-classname';
import Record from './Record';
import { useStoreState } from 'stores';
import { usePlayerCurrentTime } from 'player/hooks';
import FrameWorker from 'player/frame';
import Player from 'player';

const bem = BEMProvider('actions');
// We can get this number from single record item's height
const RECORD_ITEM_HEIGHT = 47.5;

// List some critical actions here
export default function Actions() {
  const actionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLUListElement>(null);

  const currentTime = usePlayerCurrentTime();

  const actions = useStoreState('criticalActionIndexs');
  const recordList = useStoreState('recordList');
  const fullScreen = useStoreState('fullScreen');

  const [modalVisible, setModalVisible] = useState(false);

  const jumpToThisRecord = useCallback(
    (record: any) => {
      const whereJumpTo = record.t / FrameWorker.duration;
      Player.pause();
      Player.jump(whereJumpTo);
    },
    [FrameWorker.duration]
  );

  const seeDetail = useCallback(
    (title, body, footer) => {
      console.log('TCL: seeDetail -> record', title);
    },
    [null]
  );

  let lastPlayingState = false;

  const handleMouseEnter = () => {
    if (Player.playing) {
      Player.pause();
      lastPlayingState = true;
      return;
    }
    lastPlayingState = false;
  };

  const handleMouseLeave = () => {
    if (lastPlayingState) {
      Player.play();
    }
  };

  let playedRecordsCount = 0;
  const activeRecords: number[] = [];

  const CriticalActionList = actions.map(({ record, time }, index) => {
    const isPlayed = currentTime > time;

    const isActive = isPlayed && time + 1000 >= currentTime;

    const data = recordList[record];

    if (isPlayed && isActive) {
      activeRecords.push(index);
    } else if (isPlayed && !isActive) {
      playedRecordsCount = index + 1;
    }

    return (
      <Record
        key={index}
        active={isActive}
        data={data}
        onClick={jumpToThisRecord}
        onDoubleClick={seeDetail}
      />
    );
  });

  const hasActiveRecord: boolean = !!activeRecords.length;

  const passedRecordsCount = hasActiveRecord ? activeRecords[0] : 0;
  const activeRecordsCount = hasActiveRecord ? activeRecords.length / 2 : 0;

  // if activeRecords is not empty, scrollTop should be the esult of passedItems' height + activeItems' half height
  // if no activeRecord exists, scrollTop equals to playedRecordItems' height
  const scrollTop = hasActiveRecord
    ? (passedRecordsCount + activeRecordsCount) * RECORD_ITEM_HEIGHT
    : playedRecordsCount * RECORD_ITEM_HEIGHT;

  return (
    <div
      {...bem({ full: fullScreen })}
      ref={actionsRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ul
        {...bem('::container')}
        ref={containerRef}
        style={{ transform: `translate3d(0, ${-scrollTop}px, 0)` }}
      >
        {CriticalActionList}
      </ul>
      <div {...bem('::mask')} />
    </div>
  );
}
