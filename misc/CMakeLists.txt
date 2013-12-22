install(DIRECTORY "${PROJECT_SOURCE_DIR}/data/"
  DESTINATION share/hermelin
  PATTERN .hg PATTERN *~ EXCLUDE)

install(FILES "${PROJECT_SOURCE_DIR}/data/image/ic24_hermelin_mono_light.svg"
  DESTINATION share/icons/hicolor/scalable/status/
  RENAME hermelin_qt-inactive.svg)
install(FILES "${PROJECT_SOURCE_DIR}/data/image/ic24_hermelin_mono_dark.svg"
  DESTINATION share/icons/hicolor/scalable/status/
  RENAME hermelin_qt-active.svg)

set(ICON_SIZE 22x22 24x24 32x32 48x48 64x64 128x128)

foreach(size ${ICON_SIZE})
  install(FILES "${PROJECT_SOURCE_DIR}/data/icons/${size}/apps/hermelin.png"
    DESTINATION "share/icons/hicolor/${size}/apps/")
endforeach()
