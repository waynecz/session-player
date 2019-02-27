import React, { useCallback, Fragment } from 'react';
import BEMProvider from 'tools/bem-classname';
import Icon from '../../components/Icon';
import Tooltip from 'components/Tooltip';
import FrameWorker from 'player/frame';
import { _parseURL } from 'tools/utils';

type RecordProps = {
  data: any;
  active: boolean;
  onClick?: Function;
  onDoubleClick?: Function;
};

const bem = BEMProvider('record');

function get<T = string>(data, source, defaultValue = 'unknow'): T {
  return (data[source] as T) || (defaultValue as any);
}

function RelativeFilter(url: string) {
  const { relative } = _parseURL(url);
  return relative;
}

function ConsoleInputFormatter(input: any[]) {
  return input.join(', ');
}

function ErrorStackFormatter(stack: string) {
  return stack;
}

function TimeFormatter(time: number) {
  const span = Math.ceil((time - FrameWorker.firstFrameTime) / 1000);
  const min = ~~(span / 60);
  const sec = span % 60;
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

const Dispatchers = {
  xhr: data => {
    const url = get(data, 'url');
    const status = get(data, 'status');
    const response = get(data, 'response')
    const payload = get(data, 'payload')

    return {
      icon: 'wifi',
      state: null,
      tooltip: (
        <Fragment>
          <h4>{url}</h4>
          <h3>Payload:</h3>
          <pre>
            {payload}
          </pre>
          <h3>Response:</h3>
          <div {...bem('::res')}>
            {response}
          </div>
        </Fragment>
      ),
      primary: get(data, 'method').toUpperCase() + ` ${status}`,
      secondary: RelativeFilter(url)
    };
  },

  fetch: data => {
    const url = get(data, 'url');
    return {
      icon: 'wifi',
      state: null,
      tooltip: url,
      primary: get(data, 'method').toUpperCase(),
      secondary: RelativeFilter(url)
    };
  },

  beacon: data => {
    return {
      icon: 'wifi',
      state: null,
      primary: 'Beacon',
      secondary: RelativeFilter(get(data, 'url'))
    };
  },

  history: data => {
    return {
      icon: 'send',
      primary: 'Visit',
      secondary: get(data, 'to')
    };
  },

  jserr: data => {
    return {
      icon: 'warning',
      state: 'error',
      primary: 'Error',
      secondary: get(data, 'stack')
    };
  },

  unhandledrejection: data => {
    return {
      icon: 'error',
      state: 'error',
      primary: 'Reject',
      secondary: ErrorStackFormatter(get(data, 'stack', get(data, 'msg')))
    };
  },

  console: data => {
    return {
      icon: 'sms',
      state: null,
      primary: get(data, 'level'),
      secondary: ConsoleInputFormatter(get<any[]>(data, 'input'))
    };
  }
};

export default function Record({
  active,
  data,
  onClick,
  onDoubleClick
}: RecordProps) {
  if (!data.type) {
    return null;
  }

  const { icon, primary, secondary, state, tooltip } = Dispatchers[data.type](
    data
  );

  const handleClick = useCallback(
    () => {
      onClick && onClick(data);
    },
    [onClick]
  );

  const handleDoubleClick = useCallback(
    () => {
      onDoubleClick && onDoubleClick(data);
    },
    [onDoubleClick]
  );

  return (
    <Tooltip
      interactive={true}
      title={<pre {...bem('::tootip')}>{tooltip || secondary}</pre>}
      placement="right"
    >
      <li
        {...bem({ active, [state || 'normal']: true })}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <Icon name={icon} />
        <div {...bem('::detail')}>
          <p {...bem('::primary')}>{primary}</p>
          <p {...bem('::secondary')}>{secondary}</p>
          <small {...bem('::time')}>{TimeFormatter(data.t)}</small>
        </div>
      </li>
    </Tooltip>
  );
}
