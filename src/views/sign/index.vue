<template>
  <div class="app-container contract-sign">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>合同签署</span>
      </div>
      <div class="contract-container">
        <div
          class="pdf-container"
          style="height: 1131px; width: 800px; position: relative"
        >
          <vue-office-pdf
            :src="pdfUrl"
            style="height: 1131px; width: 800px"
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

          <!-- 签署方式选择 -->
          <div class="sign-type-selector">
            <h4>签署方式</h4>
            <el-radio-group v-model="signType">
              <el-radio :label="1">位置签署</el-radio>
              <el-radio :label="2">关键字签署</el-radio>
            </el-radio-group>
          </div>

          <!-- 关键字签署表单 -->
          <div v-if="signType === 2" class="keywords-options">
            <h4>关键字设置</h4>
            <el-form :model="keywordsForm" label-width="100px">
              <el-form-item v-if="activeTab === 'entSeal'" label="印章关键字">
                <el-input
                  v-model="keywordsForm.entKeyword"
                  placeholder="请输入企业印章定位关键字"
                ></el-input>
                <el-button type="text"  @click="handleKeywordEnt">默认关键字</el-button>
              </el-form-item>
              <el-form-item
                v-if="activeTab === 'personalSign'"
                label="签名关键字"
              >
                <el-input
                  v-model="keywordsForm.personalKeyword"
                  placeholder="请输入个人签名定位关键字"
                ></el-input>
                <el-button type="text"  @click="handleKeywordPersonal">默认关键字</el-button>
              </el-form-item>
            </el-form>
          </div>

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
      pollingTimer: null, // 轮询定时器
      pollingInterval: 5000, // 轮询间隔，默认5秒
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

    // 根据路由参数控制侧边栏显示
    const hideLayout = this.$route.query.hide;
    if (hideLayout === "true") {
      this.$store.dispatch("app/toggleSideBarHide", true);
    }
  },
  mounted() {
    // 启动轮询更新PDF
    this.startPolling();
  },

  beforeDestroy() {
    // 组件销毁前清除轮询定时器
    this.stopPolling();
  },
  methods: {
    // 开始轮询更新PDF
    startPolling() {
      // 清除可能存在的旧定时器
      this.stopPolling();

      // 设置新的定时器
      this.pollingTimer = setInterval(() => {
        // 添加时间戳参数避免缓存
        const timestamp = new Date().getTime();
        this.pdfUrl = `http://localhost:8080/profile/contract_${this.contractId}.pdf?t=${timestamp}`;
      }, this.pollingInterval);
    },
    handleKeywordEnt() {
      console.log(111);
      this.keywordsForm.entKeyword = "电子印章盖章处";
    },
    handleKeywordPersonal() {
      this.keywordsForm.personalKeyword = "个人手写签名处";
    },
    // 停止轮询
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },
    // PDF渲染完成回调
    pdfRendered() {
      console.log("PDF渲染完成");
      this.$nextTick(() => {
        // 获取vue-office-pdf-wrapper容器
        const pdfWrapper = this.$refs.pdfViewer.$el.querySelector(
          ".vue-office-pdf-wrapper"
        );
        if (pdfWrapper && this.$refs.pdfOverlay) {
          // 将pdf-overlay移动到vue-office-pdf-wrapper容器中
          pdfWrapper.appendChild(this.$refs.pdfOverlay);
        }
        this.initDragDrop();

        // 在PDF渲染完成后初始化签名板
        if (this.$refs.signaturePad) {
          this.initSignaturePad();
        }
      });
    },

    // 初始化签名板
    initSignaturePad() {
      const canvas = this.$refs.signaturePad;
      if (!canvas) return;

      // 设置canvas样式
      canvas.style.border = "1px solid #ccc";
      canvas.style.backgroundColor = "#fff";
      canvas.style.cursor = "crosshair";

      // 销毁旧的实例
      if (this.signaturePad) {
        this.signaturePad.off();
      }

      // 创建新的签名板实例
      this.signaturePad = new SignaturePad(canvas, {
        backgroundColor: "rgba(255, 255, 255, 0)",
        penColor: "rgba(0, 0, 0, 1)",
        minWidth: 1,
        maxWidth: 2.5,
        throttle: 16,
        velocityFilterWeight: 0.7,
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

      // 创建关闭按钮
      const closeBtn = document.createElement("div");
      closeBtn.className = "seal-close-btn";
      closeBtn.innerHTML = '<i class="el-icon-close"></i>';
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "-10px";
      closeBtn.style.right = "-10px";
      closeBtn.style.backgroundColor = "#f56c6c";
      closeBtn.style.color = "#fff";
      closeBtn.style.borderRadius = "50%";
      closeBtn.style.width = "20px";
      closeBtn.style.height = "20px";
      closeBtn.style.display = "flex";
      closeBtn.style.justifyContent = "center";
      closeBtn.style.alignItems = "center";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.zIndex = "1001";
      closeBtn.style.fontSize = "12px";
      closeBtn.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";

      // 添加关闭按钮点击事件
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        this.removeSealElement(element);
      });

      element.appendChild(img);
      element.appendChild(closeBtn);
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

    // 移除印章或签名元素
    removeSealElement(element) {
      const type = element.dataset.type;

      // 从DOM中移除元素
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }

      // 从位置列表中移除
      if (type === "ent") {
        const index = this.entPositionList.findIndex(
          (p) => p.element === element
        );
        if (index !== -1) {
          this.entPositionList.splice(index, 1);
        }
      } else {
        const index = this.personalPositionList.findIndex(
          (p) => p.element === element
        );
        if (index !== -1) {
          this.personalPositionList.splice(index, 1);
        }
      }
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

      // 获取元素的transform值
      const transform = element.style.transform;
      const translateValues = transform.match(/translate\((.+)px,\s*(.+)px\)/);

      // 如果能够获取到transform值，则使用transform值计算位置
      let offsetX, offsetY;
      if (translateValues && translateValues.length === 3) {
        // 使用transform值计算位置，这样更准确
        offsetX = parseFloat(translateValues[1]) + 50; // 50是初始left值
        offsetY = parseFloat(translateValues[2]) + 50; // 50是初始top值
      } else {
        // 计算相对于PDF容器的位置（备用方案）
        offsetX = rect.left - pdfRect.left;
        offsetY = rect.top - pdfRect.top;
      }

      // 获取当前页码和页面尺寸
      const page = Math.floor(element.getAttribute("data-y") / 1095 + 1);
      if (page < 1) page = 1; // 默认为第一页，实际应该从PDF查看器获取
      console.log(element.getAttribute("data-y"));
      console.log(page);
      const pageWidth = pdfRect.width;
      const pageHeight = pdfRect.height;

      // 计算相对坐标（百分比），这样在不同尺寸的设备上也能保持一致
      const relativeX = (offsetX / pageWidth).toFixed(4);
      const relativeY = (offsetY / pageHeight).toFixed(4);

      const position = {
        page: page,
        offsetX: offsetX,
        offsetY: offsetY,
        relativeX: relativeX, // 添加相对坐标
        relativeY: relativeY, // 添加相对坐标
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
      if (
        this.entPositionList.length === 0 &&
        this.personalPositionList.length === 0 &&
        this.signType === 1
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
      if (this.signType === 1) {
        // 位置签署模式
        requestData.entPositionList = this.entPositionList.map((p) => ({
          page: p.page,
          offsetX: p.relativeX
            ? (p.relativeX * p.pageWidth).toFixed(2)
            : p.offsetX + "",
          offsetY: p.relativeY
            ? (p.relativeY * p.pageHeight).toFixed(2)
            : p.offsetY + "",
          pageWidth: p.pageWidth + "",
          pageHeight: p.pageHeight + "",
          width: p.width + "",
          height: p.height + "",
        }));
        requestData.entPositionList.forEach((item) => {
          item.offsetY = item.offsetY - (item.page - 1) * 1095 - 30 + "";
        });
        requestData.personalPositionList = this.personalPositionList.map(
          (p) => ({
            page: p.page,
            offsetX: p.relativeX
              ? (p.relativeX * p.pageWidth).toFixed(2)
              : p.offsetX + "",
            offsetY: p.relativeY
              ? (p.relativeY * p.pageHeight).toFixed(2) - 10
              : p.offsetY + "",
            pageWidth: p.pageWidth + "",
            pageHeight: p.pageHeight + "",
            width: p.width + "",
            height: p.height + "",
          })
        );
        requestData.personalPositionList.forEach((item) => {
          item.offsetY =
            item.page <= 1
              ? item.offsetY - (item.page - 1) * 1095 + ""
              : item.offsetY - item.page * 13 - (item.page - 1) * 1095 + "";
        });
      } else if (this.signType === 2) {
        // 关键字签署模式
        if (this.keywordsForm.personalKeyword) {
          requestData.personalKeyword = this.keywordsForm.personalKeyword;
        }
        if (this.keywordsForm.entKeyword) {
          requestData.entKeyword = this.keywordsForm.entKeyword;
        }
      }
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
      this.$router.push({ path: "/goSign/index" });
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
  /* flex: 2; */
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
  /* min-width: 300px; */
  /* max-width: 400px; */
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

.draggable-seal .seal-close-btn,
.draggable-signature .seal-close-btn {
  opacity: 0;
  transition: opacity 0.3s;
}

.draggable-seal:hover .seal-close-btn,
.draggable-signature:hover .seal-close-btn {
  opacity: 1;
}
</style>
