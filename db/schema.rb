# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20121213135118) do

  create_table "companies", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "companies", ["name"], :name => "index_companies_on_name", :unique => true

  create_table "connections", :force => true do |t|
    t.integer  "invoice_id"
    t.integer  "order_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "connections", ["invoice_id"], :name => "index_connections_on_invoice_id"
  add_index "connections", ["order_id"], :name => "index_connections_on_order_id"

  create_table "invoices", :force => true do |t|
    t.integer  "plant_id"
    t.text     "notes"
    t.string   "pay_method"
    t.decimal  "amount",          :precision => 12, :scale => 2
    t.integer  "payable_id"
    t.string   "payable_type"
    t.integer  "receivable_id"
    t.string   "receivable_type"
    t.string   "status",                                         :default => "out", :null => false
    t.datetime "created_at",                                                        :null => false
    t.datetime "updated_at",                                                        :null => false
  end

  add_index "invoices", ["payable_id", "payable_type"], :name => "ion_pid_ptype"
  add_index "invoices", ["receivable_id", "receivable_type"], :name => "ion_rid_rtype"

  create_table "materials", :force => true do |t|
    t.string   "name"
    t.decimal  "quantity",     :precision => 12, :scale => 4
    t.string   "units"
    t.datetime "created_at",                                  :null => false
    t.datetime "updated_at",                                  :null => false
    t.integer  "buyable_id"
    t.string   "buyable_type"
    t.decimal  "unit_price",   :precision => 12, :scale => 4
  end

  add_index "materials", ["buyable_id", "buyable_type"], :name => "ion_b_t"
  add_index "materials", ["name", "buyable_id", "buyable_type"], :name => "ion_n_b_t", :unique => true

  create_table "orders", :force => true do |t|
    t.integer  "company_id"
    t.integer  "plant_id"
    t.string   "carrier"
    t.string   "external_id"
    t.text     "notes"
    t.datetime "created_at",                      :null => false
    t.datetime "updated_at",                      :null => false
    t.string   "genre",       :default => "sale", :null => false
  end

  add_index "orders", ["company_id"], :name => "index_orders_on_company_id"
  add_index "orders", ["external_id"], :name => "index_orders_on_external_id"
  add_index "orders", ["plant_id"], :name => "index_orders_on_plant_id"

  create_table "plants", :force => true do |t|
    t.string   "name"
    t.string   "country"
    t.string   "state"
    t.string   "city"
    t.string   "address"
    t.integer  "sqft"
    t.date     "founding_date"
    t.date     "closing_date"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
  end

  add_index "plants", ["name"], :name => "index_plants_on_name"

  create_table "users", :force => true do |t|
    t.string   "name"
    t.integer  "level",                  :default => 1
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["name"], :name => "index_users_on_name"
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
