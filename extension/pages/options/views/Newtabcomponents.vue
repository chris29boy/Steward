<template>
  <div>
    <el-row>
      <el-col :span="5">
        <div class="grid-content plugin-list">
          <div class="plugin-searchbar">
            <el-input placeholder="Search" icon="search" v-model="componentSearchText"></el-input>
          </div>
          <div
            class="plugin-item website-item"
            :class="{'is-selected': component.meta.title === (currentComponent && currentComponent.meta.title), 
              'not-visible': !component.show}"
            v-for="(component, index) in filteredComponents"
            :key="index"
            @click="handleComponentClick(component)"
          >
            <span class="plugin-name">{{component.meta.title}}</span>
            <img
              v-if="component.hasNewVersion"
              class="icon icon-newversion"
              src="/iconfont/newversion.svg"
              alt
            />
          </div>
        </div>
      </el-col>
      <el-col :span="19">
        <div class="grid-content bg-black plugin-editor">
          <div v-if="currentComponent" class="plugin-editor-container">
            <div class="comp-meta">
              <div class="comp-logo" v-if="currentComponent.meta.icon">
                <img :src="currentComponent.meta.icon" alt="">
              </div>
              <div class="comp-tit">
                {{currentComponent.meta.title}}
                <span class="comp-version">{{currentComponent.version}}</span>
                <a
                  href="javascript:;"
                  style="color: #f56c6c;"
                  v-if="currentComponent.hasNewVersion"
                  @click="updateComponent"
                >Update</a>
              </div>
              <div class="author">by <a target="_blank" :href="`https://github.com/${currentComponent.meta.author}`">{{currentComponent.meta.author}}</a></div>
            </div>
            <div class="plugin-editor-config" style="overflow-y: auto;">
              <el-tabs
                style="height: 100%;"
                type="border-card"
                @tab-click="handleComponentTabClick"
              >
                <el-tab-pane label="Simple Editor">
                  <el-form
                    style="padding: 12px; min-height: 150px;"
                    ref="componentForm"
                    :model="currentComponent"
                    :rules="componentFormRuels"
                    label-width="200px"
                  >
                    <el-form-item :label="i18nTexts.ui.settings.fields.enable">
                      <el-switch v-model="currentComponent.show" on-color="#20a0ff"></el-switch>
                    </el-form-item>
                    <el-form-item v-if="currentComponent.show" :label="i18nTexts.ui.settings.fields.showByDefault">
                      <el-switch v-model="currentComponent.showByDefault" on-color="#20a0ff"></el-switch>
                    </el-form-item>
                    <el-form-item v-if="currentComponent.show" :label="i18nTexts.ui.settings.blocks.shortcutconfiguration">
                      <el-input style="width: 200px;"
                        v-model="currentComponent.shortcuts"
                        placeholder="command"
                      ></el-input>
                      <a href="https://github.com/RobertWHurst/KeyboardJS" target="_blank">?</a>
                    </el-form-item>
                    <el-form-item label="Args" v-if="currentComponent.argsSchema">
                      <json-editor :schema="currentComponent.argsSchema" v-model="currentComponent.args" />
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        @click.native.prevent="handleComponentSubmit"
                      >{{i18nTexts.ui.settings.actions.save}}</el-button>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
                <el-tab-pane label="Advanced Editor">
                  <el-input
                    class="editor"
                    type="textarea"
                    :rows="5"
                    v-if="componentTabIndex === 1"
                    v-model="currentComponentSource"
                  />
                  <div class="buttons" style="margin-top: 20px;">
                    <el-button
                      type="primary"
                      @click.native.prevent="handleComponentCodeSubmit"
                    >{{i18nTexts.ui.settings.actions.save}}</el-button>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { componentHelper } from "helper/component.helper";
import { getRemoteComponents } from 'helper/component.helper'
import JsonEditor from '@/components/jsoneditor/index.vue';
import { t } from 'helper/i18n.helper';

export default {
  name: 'Newtabcomponents',
  props: ["config", "i18nTexts"],
  
  data() {
    return {
      componentSearchText: "",
      components: [],
      currentComponent: null,
      componentTabIndex: 0,
      currentComponentSource: "",
      remoteComponents: [],
      activeFieldsName: ["meta"],
      componentFormRuels: {}
    };
  },

  components: { JsonEditor },

  computed: {
    filteredComponents() {
      const text = this.componentSearchText.toLowerCase();

      return this.components.filter(component => {
        return component.meta.title.toLowerCase().indexOf(text) > -1;
      }).sort((a, b) => {
        return Number(a.show) > Number(b.show) ? -1 : 1
      });
    }
  },

  created() {
    getRemoteComponents().then(list => {
      this.remoteComponents = list
      this.initComponents();
    })
  },

  methods: {
    initComponents() {
      componentHelper.init().then((resp = []) => {
        this.components = resp.map(oldComponent => {
          const newComponent = this.remoteComponents.find(
            item => item.id === oldComponent.id
          );
          if (newComponent) {
            oldComponent.hasNewVersion = componentHelper.hasNewVersion(
              oldComponent,
              newComponent
            );
            oldComponent.argsSchema = newComponent.argsSchema;
            if (newComponent.args) {
              oldComponent.args = Object.assign({}, newComponent.args, oldComponent.args || {})
            }
          }
          return oldComponent;
        });
      });
    },
    handleComponentClick(component) {
      const data = JSON.parse(JSON.stringify(component));

      this.currentComponent = {
        showByDefault: true,
        shortcuts: '',
        ...data
      };
      if (this.componentTabIndex === 1) {
        this.updateCurrentSource();
      }
    },

    updateCurrentSource() {
      const data = JSON.parse(JSON.stringify(this.currentComponent || {}));

      this.currentComponentSource = JSON.stringify(data);
    },

    handleComponentTabClick(tab) {
      const idx = Number(tab.index);

      if (idx === 1) {
        this.updateCurrentSource();
      }
      this.componentTabIndex = idx;
    },

    handleComponentBeforeSave() {
      const component = JSON.parse(JSON.stringify(this.currentComponent));

      return component;
    },

    submitComponent() {
      const data = this.handleComponentBeforeSave();

      return componentHelper.save(data).then(component => {
        this.afterComponentSubmit(component.toJSON());
        this.$message(t("save_ok"));
      });
    },

    refreshComponents() {
      this.initComponents()
    },

    afterComponentSubmit(component) {
      this.refreshComponents();
      this.currentComponent = component;
      this.updateCurrentSource();
    },

    handleComponentSubmit() {
      this.$refs.componentForm.validate(valid => {
        if (!valid) {
          this.$message.error(t("check_form"));
        } else {
          this.submitComponent();
        }
      });
    },

    async updateComponent() {
      const current = this.currentComponent;
      const newComponent = this.remoteComponents.find(
        item => item.id === current.id
      );

      const res = await componentHelper.updateToNewVersion(
        current,
        newComponent
      );

      this.currentComponent = res;
      this.initComponents();
      this.updateCurrentSource();
      this.$message.success("Updated");
    },

    handleComponentCodeSubmit() {
      try {
        this.currentComponent = JSON.parse(this.currentComponentSource);
        this.submitComponent();
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>

<style lang="scss">
.plugin-item {
  &.not-visible {
    .plugin-name {
      color: #999;
    }
  }
}

.comp-meta {
  display: flex;
  background: #eef1f6;
  height: 57px;
  padding: 12px;
}

.comp-logo {
  width: 30px;
  height: 30px; 
  
  img {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.comp-tit {
  margin-left: 8px;
  flex: 1;
  font-size: 24px;
}

.comp-version {
  font-size: 12px;
  color: #666;
}
</style>
