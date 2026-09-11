/* TaskFlow Dashboard Notifications + Remember Me */
(function(){
  'use strict';
  const STYLE_ID='tf-dashboard-notify-style', TOAST_ID='tf-dashboard-notify-toast', MODAL_ID='tf-dashboard-confirm';
  const database=()=>window.firebase?.database?.();

  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style'); s.id=STYLE_ID;
    s.textContent=`
      #${TOAST_ID}{position:fixed;left:24px;top:50%;bottom:auto;z-index:10000;min-width:280px;max-width:420px;padding:14px 18px;border-radius:14px;background:rgba(23,26,35,.97);color:#fff;border:1px solid #10b981;box-shadow:0 14px 40px rgba(0,0,0,.35);display:flex;align-items:center;gap:10px;opacity:0;transform:translateY(-50%) translateX(-24px);pointer-events:none;transition:.25s;font-size:14px;font-weight:700;direction:rtl}
      #${TOAST_ID}.show{opacity:1;transform:translateY(-50%) translateX(0)}
      #${TOAST_ID} .tf-check{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#10b981;color:#07130e;flex:0 0 auto;font-weight:900}
      #${MODAL_ID}{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.68);backdrop-filter:blur(5px);display:none;align-items:center;justify-content:center;padding:20px;direction:rtl}
      #${MODAL_ID}.show{display:flex}
      #${MODAL_ID} .tf-confirm-box{width:min(440px,100%);background:#171a23;border:1px solid #2a2e3d;border-radius:18px;padding:22px;box-shadow:0 20px 70px rgba(0,0,0,.45)}
      #${MODAL_ID} h3{margin:0 0 8px;font-size:18px;color:#fff}
      #${MODAL_ID} p{margin:0;color:#9ca3af;font-size:13px;line-height:1.8}
      #${MODAL_ID} .tf-confirm-actions{display:flex;gap:9px;justify-content:flex-start;margin-top:20px}
      #${MODAL_ID} button{border:1px solid #2a2e3d;border-radius:10px;padding:10px 16px;cursor:pointer;font:inherit;font-weight:700}
      #${MODAL_ID} .tf-cancel{background:#212635;color:#fff}
      #${MODAL_ID} .tf-danger{background:#581c20;border-color:#b51f32;color:#fff}
      #tf-remember-row{display:flex;align-items:center;gap:8px;margin:-4px 0 18px;color:#cbd5e1;font-size:12px;cursor:pointer;user-select:none}
      #tf-remember-row input{width:17px;height:17px;accent-color:#635bff;cursor:pointer}
    `;
    document.head.appendChild(s);
  }

  function success(message){
    ensureStyle();
    let t=document.getElementById(TOAST_ID);
    if(!t){t=document.createElement('div');t.id=TOAST_ID;document.body.appendChild(t);}
    t.innerHTML='<span class="tf-check">✓</span><span></span>';
    t.querySelector('span:last-child').textContent=message;
    t.classList.add('show'); clearTimeout(t._timer); t._timer=setTimeout(()=>t.classList.remove('show'),3000);
  }
  window.taskflowSuccess=success;
  window.alert=function(message){success(String(message||'تم تنفيذ العملية.'));};

  function dashboardConfirm(message,onYes){
    ensureStyle(); let m=document.getElementById(MODAL_ID);
    if(!m){
      m=document.createElement('div');m.id=MODAL_ID;
      m.innerHTML='<div class="tf-confirm-box" role="dialog" aria-modal="true"><h3>تأكيد العملية</h3><p></p><div class="tf-confirm-actions"><button class="tf-cancel" type="button">إلغاء</button><button class="tf-danger" type="button">تأكيد</button></div></div>';
      document.body.appendChild(m);
      m.querySelector('.tf-cancel').onclick=()=>m.classList.remove('show');
      m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show');});
    }
    m.querySelector('p').textContent=message;
    m.querySelector('.tf-danger').onclick=()=>{m.classList.remove('show');onYes();};
    m.classList.add('show');
  }

  window.deleteMember=function(key){
    dashboardConfirm('هل أنت متأكد من حذف هذا العضو نهائياً؟',function(){
      const db=database(); if(!db){success('تعذر الاتصال بقاعدة البيانات.');return;}
      db.ref('members/'+key).remove().then(()=>success('تم حذف العضو بنجاح.')).catch(err=>success('تعذر حذف العضو: '+(err?.message||'خطأ غير معروف')));
    });
  };

  function installRememberMe(){
    const form=document.getElementById('loginForm');
    if(!form)return;
    ensureStyle();
    let row=document.getElementById('tf-remember-row');
    if(!row){
      row=document.createElement('label');
      row.id='tf-remember-row';
      row.innerHTML='<input type="checkbox" id="tfRememberMe"><span>تذكرني على هذا الجهاز</span>';
      const pass=document.getElementById('loginPassInput');
      pass?.closest('.field')?.insertAdjacentElement('afterend',row);
    }
    const checkbox=document.getElementById('tfRememberMe');
    if(checkbox&&!checkbox.dataset.initialized){
      checkbox.checked=localStorage.getItem('taskflow_remember_me')==='1';
      checkbox.dataset.initialized='1';
    }
    if(form.dataset.tfRememberWrapped)return;
    form.addEventListener('submit',function(e){
      // هذا المعالج هو المسؤول الوحيد عن تسجيل الدخول؛ امنع onsubmit القديم من العمل معه.
      e.preventDefault();
      e.stopImmediatePropagation();
      const inputName=document.getElementById('loginNameInput').value.trim().toLowerCase();
      const inputPass=document.getElementById('loginPassInput').value.trim();
      const user=window.members.find(m=>m.name.toLowerCase().includes(inputName)||inputName.includes(m.name.toLowerCase()));
      if(!user){success('اسم الموظف غير مسجل بالنظام!');return;}
      if(user.status==='disabled'){success('هذا الحساب معطل حالياً من قبل مدير النظام!');return;}
      if(user.pass!==inputPass){success('كلمة المرور غير صحيحة!');return;}

      currentUserId=user.firebaseKey;
      const remember=!!document.getElementById('tfRememberMe')?.checked;
      if(remember){
        localStorage.setItem('taskflow_user_id',user.firebaseKey);
        localStorage.setItem('taskflow_remember_me','1');
      }else{
        localStorage.removeItem('taskflow_user_id');
        localStorage.removeItem('taskflow_remember_me');
      }
      document.getElementById('loginScreen').style.display='none';
      document.getElementById('appMain').style.display='flex';
      window.applyUserPermissions?.(user);
      window.toast?.(`أهلاً بك 👋 ${user.name}`);
      window.renderAll?.();
    },true);
    form.dataset.tfRememberWrapped='1';
  }

  function install(){
    ensureStyle();
    installRememberMe();
    if(!database()) return false;
    const db=database();

    const taskForm=document.getElementById('taskForm');
    if(taskForm&&!taskForm.dataset.tfNotifyWrapped){
      taskForm.onsubmit=function(e){
        e.preventDefault();
        const key=e.target.dataset.edit;
        const data={title:document.getElementById('fTitle').value,desc:document.getElementById('fDesc').value,memberKey:document.getElementById('fMember').value,priority:document.getElementById('fPriority').value,status:document.getElementById('fStatus').value,start:document.getElementById('fStartDate').value,due:document.getElementById('fDueDate').value,progress:+document.getElementById('fProgress').value};
        if(data.status==='Completed')data.progress=100;
        const op=key?db.ref('tasks/'+key).update(data):db.ref('tasks').push(data);
        Promise.resolve(op).then(()=>{window.closeModal?.();success(key?'تم تحديث المهمة بنجاح.':'تمت إضافة المهمة بنجاح.');}).catch(err=>success('تعذر حفظ المهمة: '+(err?.message||'خطأ غير معروف')));
      };
      taskForm.dataset.tfNotifyWrapped='1';
    }

    const memberForm=document.getElementById('memberForm');
    if(memberForm&&!memberForm.dataset.tfNotifyWrapped){
      const originalEdit=window.editMemberModal;
      if(typeof originalEdit==='function'&&!window.editMemberModal.__tfWrapped){
        window.editMemberModal=function(key){memberForm.dataset.tfMemberKey=key;return originalEdit.apply(this,arguments);};
        window.editMemberModal.__tfWrapped=true;
      }
      memberForm.onsubmit=function(e){
        e.preventDefault();
        const key=memberForm.dataset.tfMemberKey||null;
        const data={name:document.getElementById('mName').value,role:document.getElementById('mRole').value,type:document.getElementById('mType').value,pass:document.getElementById('mPass').value,status:'active'};
        let op=key?db.ref('members/'+key).update(data):(data.hiddenPages=[],db.ref('members').push(data));
        Promise.resolve(op).then(()=>{window.closeMemberModal?.();memberForm.dataset.tfMemberKey='';success(key?'تم تعديل بيانات العضو بنجاح.':'تمت إضافة العضو بنجاح.');}).catch(err=>success('تعذر حفظ العضو: '+(err?.message||'خطأ غير معروف')));
      };
      memberForm.dataset.tfNotifyWrapped='1';
    }

    window.changeMyPassword=function(){
      const input=document.getElementById('newPassInput'), val=(input?.value||'').trim();
      const user=typeof window.getCurrentUser==='function'?window.getCurrentUser():null;
      const key=user?.firebaseKey;
      if(!val){success('اكتب كلمة المرور الجديدة أولاً.');return;}
      if(!key){success('تعذر تحديد الحساب الحالي.');return;}
      db.ref('members/'+key).update({pass:val}).then(()=>{input.value='';success('تم تغيير كلمة المرور بنجاح.');}).catch(err=>success('تعذر تغيير كلمة المرور: '+(err?.message||'خطأ غير معروف')));
    };

    window.toggleBlockMember=function(key,st){
      const next=st==='disabled'?'active':'disabled';
      db.ref('members/'+key).update({status:next}).then(()=>success(next==='disabled'?'تم إيقاف العضو بنجاح.':'تم تفعيل العضو بنجاح.')).catch(err=>success('تعذر تحديث حالة العضو: '+(err?.message||'خطأ غير معروف')));
    };

    const originalPerm=window.openPermissionsModal;
    if(typeof originalPerm==='function'&&!originalPerm.__tfWrapped){
      window.openPermissionsModal=function(key){const el=document.getElementById('permissionsModal');if(el)el.dataset.tfMemberKey=key;return originalPerm.apply(this,arguments);};
      window.openPermissionsModal.__tfWrapped=true;
    }
    window.savePermissions=function(){
      const modal=document.getElementById('permissionsModal'), key=modal?.dataset.tfMemberKey;
      if(!key)return;
      const pages=['dashboard','tasks','dailylog','calendar','board','reports'];
      const hidden=pages.filter(p=>{const c=document.getElementById('perm_'+p);return c&&!c.checked;});
      db.ref('members/'+key).update({hiddenPages:hidden}).then(()=>{window.closePermissionsModal?.();success('تم حفظ الصلاحيات بنجاح.');}).catch(err=>success('تعذر حفظ الصلاحيات: '+(err?.message||'خطأ غير معروف')));
    };
    return true;
  }

  function boot(){
    ensureStyle();
    installRememberMe();
    if(install())return;
    setTimeout(install,300);setTimeout(install,1000);setTimeout(install,2000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
