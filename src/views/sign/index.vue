<template>
  <div class="app-container contract-sign">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>合同签署</span>
      </div>
      <div class="contract-container">
        <div class="pdf-container">
          <vue-office-pdf
            :src="pdfUrl"
            style="height: 75vh"
            @rendered="pdfRendered"
            ref="pdfViewer"
          />
          <div class="pdf-overlay" ref="pdfOverlay">
            <!-- 这里会动态添加签名和印章元素 -->
          </div>
        </div>
        <div class="tools-container">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="企业印章" name="entSeal">
              <div class="seal-options">
                <h4>印章生成方式</h4>
                <el-radio-group v-model="sealGenerateType">
                  <el-radio label="upload">上传图片生成</el-radio>
                  <el-radio label="params">参数生成</el-radio>
                </el-radio-group>

                <!-- 上传图片生成印章 -->
                <div v-if="sealGenerateType === 'upload'" class="upload-seal">
                  <el-upload
                    class="upload-demo"
                    action="#"
                    :http-request="handleSealUpload"
                    :show-file-list="false"
                    :before-upload="beforeSealUpload"
                  >
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">
                      只能上传jpg/png文件，且不超过2MB
                    </div>
                  </el-upload>
                  <div v-if="entSealPreview" class="seal-preview">
                    <img :src="entSealPreview" alt="企业印章预览" />
                    <el-button
                      size="small"
                      type="success"
                      @click="addSealToContract('ent')"
                      >添加到合同</el-button
                    >
                  </div>
                </div>

                <!-- 参数生成印章 -->
                <div v-if="sealGenerateType === 'params'" class="params-seal">
                  <el-form :model="sealParams" label-width="80px">
                    <el-form-item label="上部文字">
                      <el-input
                        v-model="sealParams.topText"
                        placeholder="请输入印章上部文字"
                      ></el-input>
                    </el-form-item>
                    <el-form-item label="中部文字">
                      <el-input
                        v-model="sealParams.middleText"
                        placeholder="请输入印章中部文字"
                      ></el-input>
                    </el-form-item>
                    <el-button type="primary" @click="generateSealByParams"
                      >生成印章</el-button
                    >
                  </el-form>
                  <div v-if="entSealPreview" class="seal-preview">
                    <img :src="entSealPreview" alt="企业印章预览" />
                    <el-button
                      size="small"
                      type="success"
                      @click="addSealToContract('ent')"
                      >添加到合同</el-button
                    >
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="个人签名" name="personalSign">
              <div class="signature-options">
                <h4>签名方式</h4>
                <el-radio-group v-model="signatureType">
                  <el-radio label="handwrite">手写签名</el-radio>
                  <el-radio label="upload">上传图片</el-radio>
                </el-radio-group>

                <!-- 手写签名 -->
                <div
                  v-if="signatureType === 'handwrite'"
                  class="handwrite-signature"
                >
                  <div class="signature-pad-container">
                    <canvas
                      ref="signaturePad"
                      width="320"
                      height="200"
                    ></canvas>
                    <div class="signature-actions">
                      <el-button size="small" @click="clearSignature"
                        >清除</el-button
                      >
                      <el-button
                        size="small"
                        type="primary"
                        @click="saveSignature"
                        >保存签名</el-button
                      >
                    </div>
                  </div>
                  <div v-if="personalSignPreview" class="signature-preview">
                    <img :src="personalSignPreview" alt="个人签名预览" />
                    <el-button
                      size="small"
                      type="success"
                      @click="addSealToContract('personal')"
                      >添加到合同</el-button
                    >
                  </div>
                </div>

                <!-- 上传签名图片 -->
                <div v-if="signatureType === 'upload'" class="upload-signature">
                  <el-upload
                    class="upload-demo"
                    action="#"
                    :http-request="handleSignatureUpload"
                    :show-file-list="false"
                    :before-upload="beforeSignatureUpload"
                  >
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">
                      只能上传jpg/png文件，且不超过2MB
                    </div>
                  </el-upload>
                  <div v-if="personalSignPreview" class="signature-preview">
                    <img :src="personalSignPreview" alt="个人签名预览" />
                    <el-button
                      size="small"
                      type="success"
                      @click="addSealToContract('personal')"
                      >添加到合同</el-button
                    >
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>

          <div class="sign-actions">
            <el-button type="primary" @click="signContract">签署合同</el-button>
            <el-button @click="resetSign">重置</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 签署成功对话框 -->
    <el-dialog
      title="签署成功"
      :visible.sync="signSuccessDialogVisible"
      width="30%"
    >
      <div class="success-content">
        <i class="el-icon-success" style="font-size: 48px; color: #67c23a"></i>
        <p>合同签署成功！</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="goBack">返回</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import VueOfficePdf from "@vue-office/pdf";
import { generateUpload, generateSeal, signContract } from "@/api/openSign";
import SignaturePad from "signature_pad";
import interact from "interactjs";

export default {
  name: "ContractSign",
  components: {
    VueOfficePdf,
  },
  data() {
    return {
      contractId: null,
      pdfUrl: "",
      activeTab: "entSeal",
      sealGenerateType: "upload",
      signatureType: "handwrite",
      signaturePad: null,
      entSealPreview: "",
      personalSignPreview: "",
      entSealData: "", // Base64格式的企业印章数据
      personalSignData: "", // Base64格式的个人签名数据
      sealParams: {
        topText: "XX企业",
        middleText: "电子签章",
      },
      keywordsForm: {
        entKeyword: "",
        personalKeyword: "",
      },
      signType: 1, // POSITION或KEYWORDS
      entPositionList: [],
      personalPositionList: [],
      signSuccessDialogVisible: false,
      entName: "",
      personalName: "",
    };
  },
  created() {
    // 从路由参数获取合同ID
    this.contractId = this.$route.query.id;
    if (!this.contractId) {
      this.$message.error("合同ID不能为空");
      this.$router.push({ path: "/contract" });
      return;
    }

    // 获取PDF URL
    this.pdfUrl = `http://localhost:8080/profile/contract_${this.contractId}.pdf`;

    // 获取用户信息
    const userInfo = this.$store.getters.name;
    this.personalName = userInfo || "签署人";
  },
  mounted() {
    // 初始化签名板
    this.$nextTick(() => {
      if (this.$refs.signaturePad) {
        this.initSignaturePad();
      }
    });
  },
  methods: {
    // PDF渲染完成回调
    pdfRendered() {
      console.log("PDF渲染完成");
      this.$nextTick(() => {
        this.initDragDrop();
      });
    },

    // 初始化签名板
    initSignaturePad() {
      const canvas = this.$refs.signaturePad;
      this.signaturePad = new SignaturePad(canvas, {
        backgroundColor: "rgba(255, 255, 255, 1)",
        penColor: "rgba(0, 0, 0, 1)",
      });
    },

    // 清除签名
    clearSignature() {
      if (this.signaturePad) {
        this.signaturePad.clear();
      }
    },

    // 保存签名
    saveSignature() {
      if (this.signaturePad && !this.signaturePad.isEmpty()) {
        const signatureData = this.signaturePad.toDataURL();
        this.personalSignPreview = signatureData;
        this.personalSignData = signatureData.split(",")[1]; // 去掉data:image/png;base64,前缀
      } else {
        this.$message.warning("请先进行签名");
      }
    },

    // 上传印章图片前的验证
    beforeSealUpload(file) {
      const isImage = file.type.indexOf("image/") === 0;
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error("上传印章图片只能是图片格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传印章图片大小不能超过 2MB!");
      }
      return isImage && isLt2M;
    },

    // 处理印章图片上传
    handleSealUpload({ file }) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgData = e.target.result;
        this.entSealPreview = imgData;
        // 调用后端接口生成印章
        generateUpload({
          image: imgData.split(",")[1], // 去掉data:image/png;base64,前缀
          colorRange: 10, // 默认颜色范围
        })
          .then((response) => {
            if (response.code === 200) {
              this.entSealData = response.result.entSeal;

              this.entSealPreview =
                "data:image/png;base64," + response.result.entSeal;

              this.$message.success("印章生成成功");
            } else {
              this.$message.error(response.msg || "印章生成失败");
            }
          })
          .catch(() => {
            this.$message.error("印章生成请求失败");
          });
      };
      reader.readAsDataURL(file);
    },

    // 参数生成印章
    generateSealByParams() {
      debugger;
      if (!this.sealParams.topText || !this.sealParams.middleText) {
        this.$message.warning("请填写完整的印章文字");
        return;
      }

      generateSeal(this.sealParams)
        .then((response) => {
          if (response.code === 200) {
            this.entSealData = response.result.entSeal;
            this.entSealPreview =
              "data:image/png;base64," + response.result.entSeal;
            this.$message.success("印章生成成功");
          } else {
            this.$message.error(response.msg || "印章生成失败");
          }
        })
        .catch(() => {
          this.$message.error("印章生成请求失败");
        });
    },

    // 上传签名图片前的验证
    beforeSignatureUpload(file) {
      const isImage = file.type.indexOf("image/") === 0;
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error("上传签名图片只能是图片格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传签名图片大小不能超过 2MB!");
      }
      return isImage && isLt2M;
    },

    // 处理签名图片上传
    handleSignatureUpload({ file }) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgData = e.target.result;
        this.personalSignPreview = imgData;
        this.personalSignData = imgData.split(",")[1]; // 去掉data:image/png;base64,前缀
      };
      reader.readAsDataURL(file);
    },

    // 添加印章或签名到合同
    addSealToContract(type) {
      const overlay = this.$refs.pdfOverlay;
      const pdfContainer = this.$refs.pdfViewer.$el;

      // 创建可拖动的印章/签名元素
      const element = document.createElement("div");
      element.className =
        type === "ent" ? "draggable-seal" : "draggable-signature";

      const img = document.createElement("img");
      img.src = type === "ent" ? this.entSealPreview : this.personalSignPreview;
      img.style.width = type === "ent" ? "200px" : "150px";
      img.style.height = type === "ent" ? "200px" : "70px";

      element.appendChild(img);
      overlay.appendChild(element);

      // 设置元素的初始位置
      element.style.position = "absolute";
      element.style.left = "50px";
      element.style.top = "50px";
      element.style.cursor = "move";
      element.style.zIndex = "1000";

      // 存储元素类型和位置信息
      element.dataset.type = type;

      // 使元素可拖动
      this.makeDraggable(element, pdfContainer);
    },

    // 初始化拖放功能
    initDragDrop() {
      const pdfContainer = this.$refs.pdfViewer.$el;
      const overlay = this.$refs.pdfOverlay;

      // 确保PDF容器和覆盖层的定位正确
      pdfContainer.style.position = "relative";
      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.pointerEvents = "none"; // 允许点击穿透到PDF
    },

    // 使元素可拖动
    makeDraggable(element, container) {
      // 使元素可以接收指针事件
      element.style.pointerEvents = "auto";

      interact(element).draggable({
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: container,
            endOnly: true,
          }),
        ],
        autoScroll: true,
        listeners: {
          move: (event) => {
            const target = event.target;
            // 获取当前位置
            const x =
              (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            const y =
              (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

            // 更新元素位置
            target.style.transform = `translate(${x}px, ${y}px)`;

            // 存储位置数据
            target.setAttribute("data-x", x);
            target.setAttribute("data-y", y);

            // 更新位置列表
            this.updatePositionList(target);
          },
        },
      });
    },

    // 更新位置列表
    updatePositionList(element) {
      const type = element.dataset.type;
      const rect = element.getBoundingClientRect();
      const pdfContainer = this.$refs.pdfViewer.$el;
      const pdfRect = pdfContainer.getBoundingClientRect();

      // 计算相对于PDF容器的位置
      const offsetX = rect.left - pdfRect.left;
      const offsetY = rect.top - pdfRect.top;

      // 获取当前页码和页面尺寸
      const page = 1; // 默认为第一页，实际应该从PDF查看器获取
      const pageWidth = pdfRect.width;
      const pageHeight = pdfRect.height;

      const position = {
        page: page,
        offsetX: offsetX,
        offsetY: offsetY,
        pageWidth: pageWidth,
        pageHeight: pageHeight,
        width: type === "ent" ? 200 : 150,
        height: type === "ent" ? 200 : 70,
      };

      // 更新位置列表
      if (type === "ent") {
        // 检查是否已存在该元素的位置信息
        const index = this.entPositionList.findIndex(
          (p) => p.element === element
        );
        if (index !== -1) {
          this.entPositionList[index] = { ...position, element };
        } else {
          this.entPositionList.push({ ...position, element });
        }
      } else {
        const index = this.personalPositionList.findIndex(
          (p) => p.element === element
        );
        if (index !== -1) {
          this.personalPositionList[index] = { ...position, element };
        } else {
          this.personalPositionList.push({ ...position, element });
        }
      }
    },

    // 签署合同
    signContract() {
      // 位置签署模式
      if (
        this.entPositionList.length === 0 &&
        this.personalPositionList.length === 0
      ) {
        this.$message.warning("请至少添加一个印章或签名到合同");
        return;
      }

      // 准备签署请求数据
      const requestData = {
        contractId: +this.contractId,
        signType: this.signType,
        entName: this.entName || "企业名称",
        personalName: this.personalName,
      };

      requestData.entPositionList = this.entPositionList.map((p) => ({
        page: p.page,
        offsetX: p.offsetX + "",
        offsetY: p.offsetY + "",
        pageWidth: p.pageWidth + "",
        pageHeight: p.pageHeight + "",
        width: p.width + "",
        height: p.height + "",
      }));

      requestData.personalPositionList = this.personalPositionList.map((p) => ({
        page: p.page,
        offsetX: p.offsetX + "",
        offsetY: p.offsetY + "",
        pageWidth: p.pageWidth + "",
        pageHeight: p.pageHeight + "",
        width: p.width + "",
        height: p.height + "",
      }));

      // 设置印章和签名数据
      if (this.entSealData) {
        requestData.entSeal = this.entSealData;
      }

      if (this.personalSignData) {
        requestData.personalSeal = this.personalSignData;
      }

      // 调用签署接口
      signContract(requestData)
        .then((response) => {
          if (response.code === 200) {
            this.signSuccessDialogVisible = true;
          } else {
            this.$message.error(response.msg || "签署失败");
          }
        })
        .catch(() => {
          this.$message.error("签署请求失败");
        });
    },

    // 重置签署
    resetSign() {
      // 清除所有印章和签名
      const overlay = this.$refs.pdfOverlay;
      while (overlay.firstChild) {
        overlay.removeChild(overlay.firstChild);
      }

      // 重置数据
      this.entPositionList = [];
      this.personalPositionList = [];
      this.keywordsForm.entKeyword = "";
      this.keywordsForm.personalKeyword = "";
    },

    // 返回上一页
    goBack() {
      this.$router.push({ path: "/contract" });
    },
  },
};
</script>

<style scoped>
.contract-sign {
  padding: 20px;
}

.contract-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.pdf-container {
  flex: 2;
  position: relative;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.pdf-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tools-container {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  padding: 15px;
}

.seal-options,
.signature-options,
.keywords-options {
  margin-top: 15px;
}

.signature-pad-container {
  margin-top: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

canvas {
  border: 1px solid #ccc;
  display: block;
  margin: 0 auto;
}

.signature-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

.seal-preview,
.signature-preview {
  margin-top: 15px;
  text-align: center;
}

.seal-preview img,
.signature-preview img {
  max-width: 100%;
  border: 1px dashed #ccc;
  padding: 5px;
  margin-bottom: 10px;
}

.sign-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.draggable-seal,
.draggable-signature {
  position: absolute;
  cursor: move;
  z-index: 1000;
  touch-action: none;
}
</style>
