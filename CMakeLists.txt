cmake_minimum_required(VERSION 2.6)
cmake_policy(SET CMP0002 OLD)
project(hermelin NONE)
set(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake/modules ${CMAKE_MODULE_PATH})

find_package(Gettext REQUIRED)

option(WITH_GTK "Enable GTK Version" On)
option(WITH_GIR "Use GIR as GTK Version" Off)

option(WITH_GTK2 "Enable GTK2 Version" Off)
option(WITH_GTK3 "Enable GTK3 Version" Off)

option(WITH_QT "Enable Qt Version" On)
option(WITH_KDE "Enable KDE4 integration for Qt" On)

option(WITH_KDE_QT "Build Qt and KDE versions at the same time" Off)
option(WITH_QT5 "Enable Qt5 Version" Off)

option(WITH_CHROME "Enable Chrome Version" Off)

find_program(INTLTOOL_MERGE intltool-merge)

if(NOT INTLTOOL_MERGE)
  message(FATAL_ERROR "intltool-merge required for i18n generation")
endif()

set(INTLTOOL_PO_DIR "${PROJECT_SOURCE_DIR}/po")

function(intltool_merge_translation infile outfile)
  add_custom_command(
    OUTPUT ${outfile}
    COMMAND LC_ALL=C ${INTLTOOL_MERGE} -d -u "${INTLTOOL_PO_DIR}"
    ${infile} ${outfile}
    DEPENDS ${infile})
endfunction()

# uninstall target
configure_file(
  "${CMAKE_CURRENT_SOURCE_DIR}/cmake/cmake_uninstall.cmake.in"
  "${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake"
  IMMEDIATE @ONLY)

add_custom_target(uninstall
  COMMAND ${CMAKE_COMMAND} -P ${CMAKE_CURRENT_BINARY_DIR}/cmake_uninstall.cmake)

function(hermelin_convert_flags __flags_var __defs_var)
  get_directory_property(_old_flags COMPILE_FLAGS)
  get_directory_property(_old_defs COMPILE_DEFINITIONS)
  set_directory_properties(PROPERTIES
    COMPILE_FLAGS ""
    COMPILE_DEFINITIONS "")
  add_definitions(${ARGN})
  get_directory_property(_new_flags COMPILE_FLAGS)
  get_directory_property(_new_defs COMPILE_DEFINITIONS)
  set_directory_properties(PROPERTIES
    COMPILE_FLAGS "${_old_flags}"
    COMPILE_DEFINITIONS "${_old_defs}")
endfunction()
if(NOT DEFINED LOCALEDIR)
  set(LOCALEDIR ${CMAKE_INSTALL_PREFIX}/share/locale)
endif()

##################### GTK Version ######################
if(WITH_GTK OR WITH_GTK2 OR WITH_GTK3)
  find_package(PythonLibrary REQUIRED)
  if(NOT PYTHONLIBRARY_FOUND)
    message(FATAL_ERROR "GTK Wrapper for Hermelin needs python")
  endif()
  include(PythonMacros)
  # for backword compatibility, if none of GTK2 or GTK3 is manually set
  # we will still use the old binary name instead of hermelin-gtk{2,3}
  if(WITH_GTK2 OR WITH_GTK3)
    set(HERMELIN_GTK_OLD_NAME Off)
  else()
    set(HERMELIN_GTK_OLD_NAME On)
  endif()

  function(hermelin_gtk_build suffix HERMELIN_GTK_NAME dir)
    if(HERMELIN_GTK_OLD_NAME)
      set(HERMELIN_BIN_NAME "hermelin")
      set(HERMELIN_PY_NAME "hermelin")
    else()
      set(HERMELIN_BIN_NAME "hermelin-${suffix}")
      set(HERMELIN_PY_NAME "hermelin_${suffix}")
    endif()
    set(hermelin_bin "${CMAKE_CURRENT_BINARY_DIR}/scripts/${HERMELIN_BIN_NAME}")
    configure_file("${CMAKE_CURRENT_SOURCE_DIR}/scripts/hotot.in"
      "${hermelin_bin}" @ONLY)
    install(PROGRAMS "${hermelin_bin}" DESTINATION bin)
    add_subdirectory("${dir}")
    configure_file("misc/hermelin-${suffix}.desktop.in.in"
      "misc/${HERMELIN_BIN_NAME}.desktop.in")
    intltool_merge_translation(
      "${CMAKE_CURRENT_BINARY_DIR}/misc/${HERMELIN_BIN_NAME}.desktop.in"
      "${CMAKE_CURRENT_BINARY_DIR}/misc/${HERMELIN_BIN_NAME}.desktop")
    add_custom_target("desktopfile-${HERMELIN_BIN_NAME}" ALL
      DEPENDS "${CMAKE_CURRENT_BINARY_DIR}/misc/${HERMELIN_BIN_NAME}.desktop")
    install(FILES "${CMAKE_CURRENT_BINARY_DIR}/misc/${HERMELIN_BIN_NAME}.desktop"
      DESTINATION share/applications/)
  endfunction()

  if(WITH_GIR)
    set(WITH_GTK3 On)
  else()
    set(WITH_GTK2 On)
  endif()
  if(WITH_GTK2)
    hermelin_gtk_build(gtk2 Gtk2 hermelin)
  endif()
  if(WITH_GTK3)
    hermelin_gtk_build(gtk3 Gtk3 hermelin-gir)
  endif()
endif()

##################### CHROME Version ######################
if(WITH_CHROME)
  add_subdirectory(chrome)
endif()

##################### Qt Version ######################

if(WITH_QT5)
  add_subdirectory(qt5)
endif()

if(WITH_QT OR WITH_KDE_QT)
  add_subdirectory(qt)
endif()

add_subdirectory(po)
add_subdirectory(misc)
