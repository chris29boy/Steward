/**
 * @description components manager
 * @author tomasy
 * @email solopea@gmail.com
 */

import { StewardApp } from 'common/type';
import { componentHelper, getComponentsConfig } from 'helper/component.helper';
import { Plugin } from 'plugins/type';
import { t } from 'helper/i18n.helper';
import { getURL } from 'helper/extension.helper';

export default function(Steward: StewardApp): Plugin {
  const { chrome, util } = Steward;

  const version = 1;
  const name = 'component';
  const keys = [{ key: 'show' }, { key: 'hide' }];
  const type = 'keyword';
  const icon = getURL('img/icon.png');
  const title = t(`${name}_title`);
  const commands = util.genCommands(name, icon, keys, type);

  function dataFormatter(item) {
    const { title, subtitle, icon: theIcon, id } = item.meta;
    return {
      key: 'component',
      title,
      desc: subtitle,
      icon: theIcon || icon,
      id,
    };
  }

  function onInput(key, command) {
    const isShow = command.orkey === 'show';

    return getComponentsConfig().then(list => {
      const items = list
        .filter(item => item.show === !isShow)
        .map(dataFormatter);
      const matched = key ? util.getMatches(items, key, 'title') : items;

      return matched;
    });
  }

  function onEnter(item, command) {
    const { orkey } = command;
    const isShow = orkey === 'show';
    const { id } = item;

    return componentHelper
      .update({
        id,
        show: isShow,
      })
      .then(() => {
        Steward.app.refresh();
      });
  }

  return {
    version,
    name: 'Components Manager',
    category: 'other',
    icon,
    title,
    commands,
    onInput,
    onEnter,
    canDisabled: false,
  };
}
