<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="合同编号" prop="contractId">
        <el-input
          v-model="queryParams.contractId"
          placeholder="请输入合同编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="审核时间" prop="approvedTime">
        <el-date-picker
          clearable
          v-model="queryParams.approvedTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择审核时间"
        >
        </el-date-picker>
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

    <el-row :gutter="10" class="mb8">
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="approvalList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="审批编号" align="center" prop="id" />
      <el-table-column label="合同名称" align="center" prop="contractTitle" />
      <el-table-column label="合同状态" align="center" prop="status" />
      <el-table-column label="审批内容" align="center" prop="comment" />
      <el-table-column label="审批人" align="center" prop="approverName" />
      <el-table-column
        label="审批时间"
        align="center"
        prop="approvedTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.approvedTime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            :disabled="scope.row.status !== '待审批'"
            @click="handleUpdate(scope.row)"
            >审批</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            :disabled="scope.row.status !== '待审批'"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
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

    <!-- 添加或修改审核对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-link type="primary" :href="form.filePath" target="_blank"
          >点我进入全屏预览</el-link
        ><br />
        <vue-office-pdf
          :src="form.filePath"
          style="height: 75vh; margin-top: 30px; margin-bottom: 30px"
          @rendered="rendered"
        />

        <el-form-item label="评审内容" prop="comment">
          <el-input
            v-model="form.comment"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="success" @click="submitForm">通 过</el-button>
        <el-button type="danger" @click="refuseForm">驳 回</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import VueOfficePdf from "@vue-office/pdf";
// import "@vue-office/pdf/lib/index.css";

import {
  listApproval,
  getApproval,
  delApproval,
  addApproval,
  updateApproval,
  approve,
  reject,
} from "@/api/approval";

export default {
  name: "Approval",
  components: {
    VueOfficePdf,
  },
  data() {
    return {
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
      // 审核表格数据
      approvalList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        contractId: null,
        approverId: null,
        status: null,
        comment: null,
        approvedTime: null,
      },
      // 表单参数
      form: {
        filePath: "http://localhost:8080/contract_4.pdf", // 替换为你的 PDF 文件 URL
      },
      // 表单校验
      rules: {
        contractId: [
          { required: true, message: "合同id不能为空", trigger: "blur" },
        ],
        approverId: [
          { required: true, message: "审核人id不能为空", trigger: "blur" },
        ],
        status: [
          { required: true, message: "审核状态不能为空", trigger: "change" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    refuseForm() {
      reject({ id: this.form.id }).then((response) => {
        this.$modal.msgSuccess("驳回成功");
        this.open = false;
        this.getList();
      });
    },
    rendered() {
      console.log("PDF 渲染完成");
    },
    /** 查询审核列表 */
    getList() {
      this.loading = true;
      listApproval(this.queryParams).then((response) => {
        this.approvalList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        contractId: null,
        approverId: null,
        status: null,
        comment: null,
        approvedTime: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
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
      this.title = "添加审核";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getApproval(id).then((response) => {
        this.form = response.data;
        this.form.filePath = response.data.contract.filePath;
        this.open = true;
        this.title = "审批";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            approve({ id: this.form.id, comment: this.form.comment }).then(
              (response) => {
                this.$modal.msgSuccess("审批成功");
                this.open = false;
                this.getList();
              }
            );
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除审核编号为"' + ids + '"的数据项？')
        .then(function () {
          return delApproval(ids);
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
        "system/approval/export",
        {
          ...this.queryParams,
        },
        `approval_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
