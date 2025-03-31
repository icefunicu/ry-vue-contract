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
          v-model="queryParams.signed"
          placeholder="请输入合同编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="签署状态" prop="signed">
        <el-select
          v-model="queryParams.status"
          clearable="true"
          placeholder="请选择签署状态"
        >
          <el-option
            v-for="item in contractStatuses"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="签署时间" prop="signTime">
        <el-date-picker
          clearable
          v-model="queryParams.signTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择签署时间"
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
      :data="signerList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="合同编号" align="center" prop="contractId" />
      <el-table-column label="甲方" align="center" prop="contract.partyAName" />
      <el-table-column label="乙方" align="center" prop="contract.partyBName" />
      <el-table-column label="签署状态" align="center" prop="signed" />
      <el-table-column
        label="签署时间"
        align="center"
        prop="signTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.signTime, "{y}-{m}-{d}") }}</span>
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
            @click="handleGoSign(scope.row)"
            >去签署</el-button
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
  </div>
</template>

<script>
import {
  listSigner,
  getSigner,
  delSigner,
  addSigner,
  updateSigner,
} from "@/api/signer";

export default {
  name: "Signer",
  data() {
    return {
      contractStatuses: [
        { value: "0", label: "待签署" },
        { value: "1", label: "已签署" },
      ],

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
      // 合同签署表格数据
      signerList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        contractId: null,
        userId: null,
        signed: null,
        signImage: null,
        signTime: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        contractId: [
          { required: true, message: "合同id不能为空", trigger: "blur" },
        ],
        userId: [
          { required: true, message: "签署人不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询合同签署列表 */
    getList() {
      this.loading = true;
      listSigner(this.queryParams).then((response) => {
        this.signerList = response.rows;
        this.signerList.forEach((item) => {
          item.signed = item.signed === 1 ? "已签署" : "未签署";
        });
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
        userId: null,
        signed: null,
        signImage: null,
        signTime: null,
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
      this.title = "添加合同签署";
    },
    /** goSign */
    handleGoSign(row) {
      this.$router.push({ path: "/sign/index", query: { id: row.contractId } });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateSigner(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSigner(this.form).then((response) => {
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
        .confirm('是否确认删除合同签署编号为"' + ids + '"的数据项？')
        .then(function () {
          return delSigner(ids);
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
        "system/signer/export",
        {
          ...this.queryParams,
        },
        `signer_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
