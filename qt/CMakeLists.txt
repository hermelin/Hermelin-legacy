project(hermelin_qt C CXX)

if(WITH_KDE_QT)
  set(WITH_KDE On)
endif()

# Setup KDE4 support
if(WITH_KDE)
  find_package(Qt4 4.7 REQUIRED COMPONENTS QtCore QtGui QtWebkit QtSql)
  find_package(KDE4)
  if(KDE4_FOUND)
    message(STATUS "Enabling KDE4 integration")
    set(HERMELIN_KDE4_INCLUDE_DIRS ${KDE4_INCLUDES})
    set(HAVE_KDE 1)
  else()
    message(STATUS "KDE4 not found, disabling KDE integration")
    set(WITH_KDE_QT Off)
  endif()
elseif(WITH_QT)
  message(STATUS "Not enabling KDE4 integration")
endif()

if(WITH_QT AND NOT HAVE_KDE)
  find_package(Qt4 4.7 REQUIRED COMPONENTS QtCore QtGui QtWebkit QtSql)
  set(BUILD_QT On)
elseif(HAVE_KDE)
  set(BUILD_KDE On)
  if(WITH_KDE_QT)
    set(BUILD_QT On)
    if(NOT HERMELIN_KDE_BIN_NAME)
      set(HERMELIN_KDE_BIN_NAME hermelin-kde)
    endif()
  else()
    # specify HERMELIN_KDE_BIN_NAME if you want to rename hermelin-qt executable
    # with KDE support even if the version without KDE support is not enabled
    if(NOT HERMELIN_KDE_BIN_NAME)
      set(HERMELIN_KDE_BIN_NAME hermelin-qt)
    endif()
  endif()
endif()

set(CMAKE_CXX_FLAGS "-Wall -Wextra -Wno-sign-compare -Wno-unused-parameter -fvisibility=hidden ${CMAKE_CXX_FLAGS}")
set(CMAKE_SHARED_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_SHARED_LINKER_FLAGS}")
set(CMAKE_MODULE_LINKER_FLAGS "-Wl,--as-needed ${CMAKE_MODULE_LINKER_FLAGS}")

configure_file(config.h.in config.h)

set(HERMELIN_QT4_INCLUDE_DIRS
  ${QT_INCLUDE_DIR}
  ${QT_QTCORE_INCLUDE_DIR}
  ${QT_QTGUI_INCLUDE_DIR}
  ${QT_QTWEBKIT_INCLUDE_DIR}
  ${QT_QTNETWORK_INCLUDE_DIR})

function(hermelin_set_qt4_target tgt)
  get_target_property(HERMELIN_INCLUDES "${tgt}" INCLUDE_DIRECTORIES)
  if(HERMELIN_INCLUDES)
    set(HERMELIN_QT4_INCLUDE_DIRS ${HERMELIN_QT4_INCLUDE_DIRS}
      ${HERMELIN_INCLUDES})
  endif()
  set_target_properties("${tgt}"
    PROPERTIES LINKER_LANGUAGE CXX
    INCLUDE_DIRECTORIES "${HERMELIN_QT4_INCLUDE_DIRS}")
  target_link_libraries("${tgt}" ${HERMELIN_QT_LINKS})
endfunction()

function(hermelin_set_kde4_target tgt)
  hermelin_set_qt4_target("${tgt}")
  get_target_property(HERMELIN_INCLUDES "${tgt}" INCLUDE_DIRECTORIES)
  if(HERMELIN_INCLUDES)
    set(HERMELIN_KDE4_INCLUDE_DIRS ${HERMELIN_KDE4_INCLUDE_DIRS}
      ${HERMELIN_INCLUDES})
  endif()
  hermelin_convert_flags(HERMELIN_KDE4_DEFS HERMELIN_KDE4_FLAGS ${KDE4_DEFINITIONS})
  set_target_properties("${tgt}"
    PROPERTIES COMPILE_DEFINITIONS "HAVE_KDE=1;${HERMELIN_KDE4_DEFS}"
    COMPILE_FLAGS "${HERMELIN_KDE4_FLAGS}"
    INCLUDE_DIRECTORIES "${HERMELIN_KDE4_INCLUDE_DIRS}")
  target_link_libraries("${tgt}"
    ${KDE4_KDEUI_LIBRARY} ${KDE4_KIO_LIBS})
endfunction()

include_directories(${CMAKE_CURRENT_BINARY_DIR})
include_directories(${CMAKE_CURRENT_SOURCE_DIR})

set(Hermelin_QT_SRCS
  formpost.cpp
  hermelinrequest.cpp
  main.cpp
  mainwindow.cpp
  hermelinwebpage.cpp
  qttraybackend.cpp
  )
set(Hermelin_QT_MOC_SRCS
  mainwindow.h
  formpost.h
  hermelinrequest.h
  hermelinwebpage.h
  qttraybackend.h
  )

set(Hermelin_KDE_SRCS
  kdetraybackend.cpp
  )
set(Hermelin_KDE_MOC_SRCS
  kdetraybackend.h
  )

if(BUILD_QT OR BUILD_KDE)
  qt4_wrap_cpp(Hermelin_QT_MOCS ${Hermelin_QT_MOC_SRCS})
endif()

set(HERMELIN_QT_LINKS
  ${QT_QTCORE_LIBRARY}
  ${QT_QTGUI_LIBRARY}
  ${QT_QTWEBKIT_LIBRARY}
  ${QT_QTNETWORK_LIBRARY}
  )

if(BUILD_QT)
  add_executable(hermelin-qt ${Hermelin_QT_SRCS} ${Hermelin_QT_MOCS})
  hermelin_set_qt4_target(hermelin-qt)
  install(TARGETS hermelin-qt DESTINATION bin)
  set(HERMELIN_QT_BIN hermelin-qt)
  configure_file("${PROJECT_SOURCE_DIR}/../misc/hermelin-qt.desktop.in.in"
    hermelin-qt.desktop.in @ONLY)
  intltool_merge_translation(
    "${CMAKE_CURRENT_BINARY_DIR}/hermelin-qt.desktop.in"
    "${CMAKE_CURRENT_BINARY_DIR}/hermelin-qt.desktop")
  add_custom_target(desktopfile-qt ALL
    DEPENDS "${CMAKE_CURRENT_BINARY_DIR}/hermelin-qt.desktop")
  install(FILES "${CMAKE_CURRENT_BINARY_DIR}/hermelin-qt.desktop"
    DESTINATION share/applications/)
endif()

if(BUILD_KDE)
  qt4_wrap_cpp(Hermelin_KDE_MOCS ${Hermelin_KDE_MOC_SRCS})
  add_executable("${HERMELIN_KDE_BIN_NAME}"
    ${Hermelin_QT_SRCS} ${Hermelin_QT_MOCS}
    ${Hermelin_KDE_SRCS} ${Hermelin_KDE_MOCS})
  hermelin_set_kde4_target("${HERMELIN_KDE_BIN_NAME}")
  install(TARGETS "${HERMELIN_KDE_BIN_NAME}" DESTINATION bin)
  install(FILES ../misc/hermelin_qt.svg
    DESTINATION ${KDE4_DATA_INSTALL_DIR}/desktoptheme/default/icons)
  set(HERMELIN_QT_BIN "${HERMELIN_KDE_BIN_NAME}")
  configure_file("${PROJECT_SOURCE_DIR}/../misc/hermelin-kde.desktop.in.in"
    "${HERMELIN_KDE_BIN_NAME}.desktop.in" @ONLY)
  intltool_merge_translation(
    "${CMAKE_CURRENT_BINARY_DIR}/${HERMELIN_KDE_BIN_NAME}.desktop.in"
    "${CMAKE_CURRENT_BINARY_DIR}/${HERMELIN_KDE_BIN_NAME}.desktop")
  add_custom_target(desktopfile-kde ALL
    DEPENDS "${CMAKE_CURRENT_BINARY_DIR}/${HERMELIN_KDE_BIN_NAME}.desktop")
  install(FILES "${CMAKE_CURRENT_BINARY_DIR}/${HERMELIN_KDE_BIN_NAME}.desktop"
    DESTINATION share/applications/)
endif()
