/**
 * Video project model
 */
/**
 * Project status
 */
export var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["CREATED"] = "created";
    ProjectStatus["SCRIPT_READY"] = "script_ready";
    ProjectStatus["MEDIA_SOURCED"] = "media_sourced";
    ProjectStatus["AUDIO_READY"] = "audio_ready";
    ProjectStatus["COMPOSING"] = "composing";
    ProjectStatus["RENDERING"] = "rendering";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["FAILED"] = "failed";
})(ProjectStatus || (ProjectStatus = {}));
//# sourceMappingURL=VideoProject.js.map