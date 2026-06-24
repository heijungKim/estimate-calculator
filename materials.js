/* materials.js — 자재 관리 */
var _db;
var _locations = [];      // [{ id, name }]
var _activeLocId = null;
var _editingMatId = null; // null = 추가, string = 수정

$(function() {
    _db = firebase.firestore();
    loadLocations();

    // ── 보관 장소 추가 모달 ──
    $("#btn_add_location").click(function() {
        $("#loc_name_input").val("");
        $("#loc_form_error").text("");
        showModal("location_modal");
    });
    $("#loc_modal_close, #loc_modal_cancel").click(function() {
        hideModal("location_modal");
    });
    $("#loc_modal_confirm").click(saveLocation);
    $("#loc_name_input").keydown(function(e) {
        if(e.which === 13) saveLocation();
    });

    // ── 자재 추가/수정 모달 ──
    $("#btn_add_material").click(function() {
        openMatModal(null);
    });
    $("#mat_modal_close, #mat_modal_cancel").click(function() {
        hideModal("material_modal");
    });
    $("#mat_modal_confirm").click(saveMaterial);

    // ── 장소 삭제 ──
    $("#btn_delete_location").click(deleteLocation);
});

/* ── 모달 유틸 ── */
function showModal(id) {
    $("#" + id).css("display", "flex");
}
function hideModal(id) {
    $("#" + id).css("display", "none");
}

/* ── 보관 장소 로드 ── */
function loadLocations() {
    _db.collection("material_locations")
        .orderBy("createdAt", "asc")
        .get()
        .then(function(snap) {
            _locations = [];
            snap.forEach(function(doc) {
                _locations.push({ id: doc.id, name: doc.data().name });
            });
            renderTabs();
            if(_locations.length > 0) {
                var targetId = _activeLocId || _locations[0].id;
                var exists = _locations.some(function(l) { return l.id === targetId; });
                selectLocation(exists ? targetId : _locations[0].id);
            } else {
                _activeLocId = null;
                $("#mat_no_location").show();
                $("#mat_content_card").hide();
            }
        })
        .catch(function(err) {
            console.error("보관 장소 로드 실패:", err);
        });
}

/* ── 탭 렌더링 ── */
function renderTabs() {
    var $bar = $("#mat_tab_bar");
    $bar.find(".mat-tab").remove();
    if(_locations.length === 0) {
        $("#mat_no_location").show();
        return;
    }
    $("#mat_no_location").hide();
    $.each(_locations, function(i, loc) {
        var $tab = $("<button type='button' class='mat-tab'></button>")
            .attr("data-id", loc.id)
            .text(loc.name);
        if(loc.id === _activeLocId) $tab.addClass("active");
        $tab.click(function() {
            selectLocation(loc.id);
        });
        $bar.append($tab);
    });
}

/* ── 탭 선택 ── */
function selectLocation(locId) {
    _activeLocId = locId;
    $(".mat-tab").removeClass("active");
    $(".mat-tab[data-id='" + locId + "']").addClass("active");
    var loc = _locations.find(function(l) { return l.id === locId; });
    if(loc) $("#mat_content_title").text(loc.name);
    $("#mat_content_card").show();
    loadMaterials(locId);
}

/* ── 보관 장소 저장 ── */
function saveLocation() {
    var name = $.trim($("#loc_name_input").val());
    if(!name) {
        $("#loc_form_error").text("보관 장소명을 입력해주세요.");
        return;
    }
    var dup = _locations.some(function(l) { return l.name === name; });
    if(dup) {
        $("#loc_form_error").text("이미 같은 이름의 보관 장소가 있습니다.");
        return;
    }
    $("#loc_modal_confirm").prop("disabled", true).text("추가 중...");
    _db.collection("material_locations").add({
        name: name,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function(ref) {
        hideModal("location_modal");
        _activeLocId = ref.id;
        loadLocations();
    }).catch(function(err) {
        $("#loc_form_error").text("저장 실패: " + err.message);
    }).finally(function() {
        $("#loc_modal_confirm").prop("disabled", false).text("추가하기");
    });
}

/* ── 보관 장소 삭제 ── */
function deleteLocation() {
    if(!_activeLocId) return;
    var loc = _locations.find(function(l) { return l.id === _activeLocId; });
    if(!loc) return;
    if(!confirm("'" + loc.name + "' 보관 장소와 해당 장소의 모든 자재를 삭제하시겠습니까?")) return;

    // 해당 장소의 자재 먼저 일괄 삭제 후 장소 삭제
    _db.collection("material_items")
        .where("locationId", "==", _activeLocId)
        .get()
        .then(function(snap) {
            var batch = _db.batch();
            snap.forEach(function(doc) {
                batch.delete(doc.ref);
            });
            batch.delete(_db.collection("material_locations").doc(_activeLocId));
            return batch.commit();
        })
        .then(function() {
            _activeLocId = null;
            loadLocations();
        })
        .catch(function(err) {
            alert("삭제 실패: " + err.message);
        });
}

/* ── 자재 목록 로드 ── */
function loadMaterials(locId) {
    $("#mat_tbody").html("<tr class='mat-loading-row'><td colspan='6'>불러오는 중...</td></tr>");
    _db.collection("material_items")
        .where("locationId", "==", locId)
        .orderBy("createdAt", "asc")
        .get()
        .then(function(snap) {
            renderMaterials(snap);
        })
        .catch(function(err) {
            console.error("자재 로드 실패:", err);
            $("#mat_tbody").html("<tr class='mat-empty-row'><td colspan='6'>로드 실패: " + err.message + "</td></tr>");
        });
}

/* ── 자재 목록 렌더링 ── */
function renderMaterials(snap) {
    var $tbody = $("#mat_tbody").empty();
    if(snap.empty) {
        $tbody.html("<tr class='mat-empty-row'><td colspan='6'>등록된 자재가 없습니다.</td></tr>");
        return;
    }
    var idx = 1;
    snap.forEach(function(doc) {
        var d = doc.data();
        var qty = (d.qty !== undefined && d.qty !== null) ? d.qty : "-";
        var unit = d.unit || "-";
        var notes = d.notes || "";
        var $tr = $("<tr></tr>")
            .append("<td class='mat-td-center'>" + idx++ + "</td>")
            .append("<td class='mat-td-name'>" + esc(d.name) + "</td>")
            .append("<td class='mat-td-center'>" + qty + "</td>")
            .append("<td class='mat-td-center'>" + esc(unit) + "</td>")
            .append("<td class='mat-td-notes'>" + esc(notes) + "</td>")
            .append(
                "<td class='mat-td-actions'>" +
                "<button class='mat-btn-edit' data-id='" + doc.id + "'>수정</button>" +
                "<button class='mat-btn-del' data-id='" + doc.id + "'>삭제</button>" +
                "</td>"
            );
        $tbody.append($tr);
    });

    // 수정 버튼
    $tbody.find(".mat-btn-edit").click(function() {
        var id = $(this).data("id");
        _db.collection("material_items").doc(id).get().then(function(doc) {
            if(doc.exists) openMatModal(doc.id, doc.data());
        });
    });
    // 삭제 버튼
    $tbody.find(".mat-btn-del").click(function() {
        var id = $(this).data("id");
        deleteMaterial(id);
    });
}

/* ── 자재 모달 열기 ── */
function openMatModal(id, data) {
    _editingMatId = id || null;
    $("#mat_modal_title").text(id ? "자재 수정" : "자재 추가");
    $("#mat_name_input").val(data ? data.name : "");
    $("#mat_qty_input").val(data ? (data.qty !== undefined ? data.qty : "") : "");
    $("#mat_unit_input").val(data ? (data.unit || "") : "");
    $("#mat_notes_input").val(data ? (data.notes || "") : "");
    $("#mat_form_error").text("");
    showModal("material_modal");
}

/* ── 자재 저장 ── */
function saveMaterial() {
    var name = $.trim($("#mat_name_input").val());
    if(!name) {
        $("#mat_form_error").text("자재명을 입력해주세요.");
        return;
    }
    var qtyRaw = $.trim($("#mat_qty_input").val());
    var qty = qtyRaw !== "" ? parseFloat(qtyRaw) : null;
    var unit = $.trim($("#mat_unit_input").val());
    var notes = $.trim($("#mat_notes_input").val());

    $("#mat_modal_confirm").prop("disabled", true).text("저장 중...");

    var payload = { name: name, qty: qty, unit: unit, notes: notes };

    var promise;
    if(_editingMatId) {
        promise = _db.collection("material_items").doc(_editingMatId).update(payload);
    } else {
        payload.locationId = _activeLocId;
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        promise = _db.collection("material_items").add(payload);
    }

    promise.then(function() {
        hideModal("material_modal");
        loadMaterials(_activeLocId);
    }).catch(function(err) {
        $("#mat_form_error").text("저장 실패: " + err.message);
    }).finally(function() {
        $("#mat_modal_confirm").prop("disabled", false).text("저장하기");
    });
}

/* ── 자재 삭제 ── */
function deleteMaterial(id) {
    if(!confirm("이 자재를 삭제하시겠습니까?")) return;
    _db.collection("material_items").doc(id).delete()
        .then(function() {
            loadMaterials(_activeLocId);
        })
        .catch(function(err) {
            alert("삭제 실패: " + err.message);
        });
}

/* ── HTML 이스케이프 ── */
function esc(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
