/**
 * @description calculate
 * @author  tomasy
 * @mail solopea@gmail.com
 */

import mathexp from 'math-expression-evaluator';

import { Command, Plugin } from 'plugins/type';
import { StewardApp } from 'common/type';
import { t } from 'helper/i18n.helper';
import { getURL } from 'helper/extension.helper';

export default function(Steward: StewardApp): Plugin {
  const { chrome, util } = Steward;

  const name = 'calculate';
  const version = 4;
  const type = 'always';
  const key = 'calc';
  const icon = getURL('iconfont/calc.svg');
  const title = t(`${name}_title`);
  const subtitle = t(`${name}_subtitle`);
  const commands: Command[] = [
    {
      key,
      type,
      title,
      subtitle,
      icon,
      editable: false,
    },
  ];

  function onInput(query) {
    let data = [];
    if (query.startsWith('calc ') && query) {
      return;
    }
    try {
      const result = mathexp.eval(Steward.state.str);
      data = [
        {
          key: 'copy',
          icon: icon,
          title: result,
          desc: subtitle,
          content: result,
          universal: true
        },
      ];
    } catch (e) {
      data = null;
    }

    return Promise.resolve(data);
  }

  function onEnter(item) {
    const text = item.title;

    util.copyToClipboard(text, true);

    return Promise.resolve(false);
  }

  return {
    version,
    name: 'Calculator',
    category: 'other',
    icon,
    title,
    commands,
    onInput,
    onEnter,
    canDisabled: false,
  };
}
