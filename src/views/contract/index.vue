<template>
  <div class="app-container contract-management">
    <el-card class="search-card" shadow="hover">
      <el-form
        :model="queryParams"
        ref="queryForm"
        size="small"
        :inline="true"
        v-show="showSearch"
        label-width="80px"
      >
        <el-form-item label="合同标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="请输入合同标题"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="mb8 action-bar" style="margin-top: 10px">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-card class="table-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span class="card-title">合同列表</span>
      </div>
      <el-table
        v-loading="loading"
        :data="contractList"
        @selection-change="handleSelectionChange"
        border
        stripe
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" width="80" />
        <el-table-column label="合同名称" align="center" prop="title">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row.title"
              placement="top-start"
            >
              <span class="contract-title">{{ scope.row.title }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          label="合同内容"
          align="center"
          prop="content"
          width="200"
        >
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row.content"
              placement="top-start"
            >
              <div class="content-preview text-ellipsis">
                {{ scope.row.content }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="创建人" align="center" prop="createdByName" />
        <el-table-column label="合同状态" align="center" prop="status">
          <template slot-scope="scope">
            <el-tag
              :type="statusTagType(scope.row.status)"
              effect="plain"
              size="medium"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="合同路径" align="center" prop="filePath" />
        <el-table-column
          label="合同创建时间"
          align="center"
          prop="createdTime"
          width="180"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createdTime, "{y}-{m}-{d}") }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          class-name="operation-column"
          width="200"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-view"
              circle
              :disabled="!(scope.row.status === '待查看')"
              @click="handleUpdate(scope.row)"
              title="查看"
            ></el-button>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-check"
              circle
              :disabled="
                !(
                  scope.row.status === '草稿' || scope.row.status === '待修改'
                ) || scope.row.createdBy !== userId
              "
              @click="handleSubmitContract(scope.row)"
              title="提交"
            ></el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-edit"
              circle
              :disabled="
                !(
                  scope.row.status === '草稿' || scope.row.status === '待修改'
                ) || scope.row.createdBy !== userId
              "
              @click="handleUpdate(scope.row)"
              title="修改"
            ></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              circle
              :disabled="
                !(scope.row.status === '草稿' || scope.row.status === '待修改')
              "
              @click="handleDelete(scope.row)"
              title="删除"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 添加【合同】对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="1200px"
      append-to-body
      custom-class="contract-dialog"
      :close-on-click-modal="false"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="contract-form"
      >
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="合同标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入合同标题" />
        </el-form-item>
        <el-divider content-position="left">合同内容</el-divider>
        <el-form-item label="" prop="content">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editor"
            :defaultConfig="toolbarConfig"
            :mode="mode"
          />
          <Editor
            style="height: 500px; overflow-y: hidden"
            v-model="form.content"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="onCreated"
          />
        </el-form-item>

        <el-divider content-position="left">合同配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="合同模版">
              <el-select
                placeholder="请选择合同模版"
                v-model="form.optionValue"
                @change="handleTemplateChange"
              >
                <el-option
                  v-for="item in templateList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="甲方">
              <el-select
                placeholder="请指定甲方"
                v-model="form.partyA"
                @change="handlePartAChange"
                @focus="getUserList"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="乙方">
              <el-select
                placeholder="请指定乙方"
                v-model="form.partyB"
                @change="handlePartBChange"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.userId"
                  :label="item.nickName"
                  :value="item.userId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider
          content-position="left"
          v-if="form.notifyInfoList && form.notifyInfoList.length > 0"
          >双方意见</el-divider
        >
        <el-form-item
          v-if="form.notifyInfoList && form.notifyInfoList.length > 0"
        >
          <el-card
            v-for="(item, index) in form.notifyInfoList"
            :key="index"
            class="opinion-card"
            shadow="hover"
          >
            <div class="opinion-header">{{ item.userName }}</div>
            <div class="opinion-content">{{ item.content }}</div>
          </el-card>
        </el-form-item>
        <el-form-item
          label="意见"
          v-if="form.status === '待查看' || form.status === '待修改'"
        >
          <el-input
            v-model="opinion"
            placeholder="请输入意见"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer contract-dialog-footer">
        <el-button
          v-if="form.status === '待查看' || form.status === '待修改'"
          type="primary"
          class="contract-dialog-button"
          @click="handleOpinion(form.id)"
          >提交意见</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-check"
          @click="submitForm"
          v-if="userId !== form.createdBy || form.status !== '待查看'"
          >确 定</el-button
        >
        <el-button icon="el-icon-close" @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改【合同】对话框
    <el-dialog
      :title="title"
      :visible.sync="openUpdate"
      width="1200px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" class="contract-form">
        <el-divider content-position="left">基本信息</el-divider>
        <el-form-item label="合同标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入合同标题" />
        </el-form-item>
        <el-divider content-position="left">合同内容</el-divider>
        <el-form-item label="合同内容" prop="content">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editor"
            :defaultConfig="toolbarConfig"
            :mode="mode"
          />
          <Editor
            style="height: 500px; overflow-y: hidden"
            v-model="form.content"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="onCreated"
          />
        </el-form-item>

        <el-divider content-position="left">合同配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="合同模版">
          <el-select placeholder="请选择合同模版" v-model="form.optionValue" @change="handleTemplateChange"
          >
            <el-option
              v-for="item in templateList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer contract-dialog-footer">
        <el-button type="primary" icon="el-icon-check" @click="submitForm">确 定</el-button>
        <el-button icon="el-icon-close" @click="cancel">取 消</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import {
  listContract,
  getContract,
  delContract,
  addContract,
  updateContract,
  submitContract,
  submitOpinion,
  pass,
  search,
} from "@/api//contract";
import store from "@/store";

import { listTemplates } from "@/api/template.js";

import { listUser } from "@/api/system/user.js";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

export default {
  name: "Contract",
  components: { Editor, Toolbar },

  data() {
    return {
      userId: null,
      opinion: "",
      partyA: null,
      partyB: null,
      userList: [
        { userId: 1, nickName: "甲方" },
        { userId: 2, nickName: "乙方" },
      ],
      templateList: [
        { id: 1, name: "合同模版1", content: "asdfasdf111" },
        { id: 2, name: "合同模版2", content: "asdfasdf222" },
      ],
      editor: null,
      toolbarConfig: {},
      editorConfig: { placeholder: "请输入内容..." },
      mode: "default", // or 'simple'
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 【合同】表格数据
      contractList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        content: null,
        createdBy: null,
        status: null,
        filePath: null,
        createdTime: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          { required: true, message: "合同标题不能为空", trigger: "blur" },
        ],
        content: [
          { required: true, message: "合同内容不能为空", trigger: "blur" },
        ],
      },
    };
  },
  beforeDestroy() {
    const editor = this.editor;
    if (!editor) return;
    editor.destroy(); // 组件销毁时，及时销毁编辑器
  },
  created() {
    this.userId = store.getters.userId;
    console.log(this.userId);
    this.getList();
  },
  mounted() {
    // 模拟 ajax 请求，异步渲染编辑器
  },
  methods: {
    statusTagType(status) {
      const statusMap = {
        草稿: "info",
        待查看: "warning",
        待修改: "warning",
        待审批: "primary",
        待签字: "primary",
        已签署: "success",
      };
      return statusMap[status] || "info";
    },
    handleOpinion(id) {
      // 调用后端接口，将意见提交到数据库
      console.log(id);
      submitOpinion({ id: id, opinion: this.opinion }).then((response) => {
        this.$modal.msgSuccess("提交成功");
        this.getList();
        this.open = false;
        this.opinion = "";
      });
    },
    handleSubmitContract(row) {
      submitContract({ id: row.id }).then((response) => {
        this.$modal.msgSuccess("提交成功");
        this.getList();
      });
    },
    getUserList() {
      this.loading = true;
      listUser().then((response) => {
        this.userList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleTemplateChange(e) {
      this.templateList.forEach((item) => {
        if (item.id === e) {
          this.form.content = item.content;
        }
      });
    },
    onCreated(editor) {
      this.editor = Object.seal(editor); // 一定要用 Object.seal() ，否则会报错
    },
    /** 查询【合同】列表 */
    getList() {
      this.loading = true;
      listContract(this.queryParams).then((response) => {
        this.contractList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
      listTemplates().then((response) => {
        this.templateList = response.rows;
      });
    },
    // 取消按钮
    cancel() {
      this.reset();
      this.open = false;
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        title: null,
        content: null,
        optionValue: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      if (this.queryParams.title !== "") {
        search(this.queryParams).then((response) => {
          this.contractList = response.rows;
          this.total = response.total;
        });
        return;
      }
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加【合同】";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getContract(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改【合同】";
        this.getUserList();
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.status === "待查看") {
            pass({ id: this.form.id }).then(() => {
              this.$modal.msgSuccess("提交审核");
              this.open = false;
              this.getList();
            });
            return;
          }

          if (this.form.id != null) {
            updateContract(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addContract(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除【合同】编号为"' + ids + '"的数据项？')
        .then(function () {
          return delContract(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "/contract/export",
        {
          ...this.queryParams,
        },
        `contract_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>

<style scoped>
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px; /* 根据实际需要调整 */
  display: inline-block;
}

.content-preview {
  line-height: 1.5;
}
</style>
