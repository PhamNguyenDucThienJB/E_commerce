package com.poly.datn.be.repo;

import com.poly.datn.be.domain.model.AmountMonth;
import com.poly.datn.be.domain.model.AmountYear;
import com.poly.datn.be.domain.model.CountOrder;
import com.poly.datn.be.domain.model.ReportProduct;
import com.poly.datn.be.entity.Order;
import org.aspectj.weaver.ast.Or;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {
    Page<Order> findAllByAccount_Id(Long id, Pageable pageable);
    Page<Order> findOrderByAccount_Id(Long id, Pageable pageable);
    Page<Order> findOrderByAccount_IdAndOrderStatus_Id(Long accountId, Long orderStatusId, Pageable pageable);
    Page<Order> findOrderByOrderStatus_Id(Long id, Pageable pageable);
    @Query("SELECT o FROM Order o WHERE o.orderStatus.id = :id and year(o.createDate) = :year and month(o.createDate) = :month")
    Page<Order> findOrderByOrderStatusAndYearAndMonth(@Param("id") Long id, @Param("year") Integer year, @Param("month") Integer month, Pageable pageable);
    @Query("SELECT o FROM Order o WHERE year(o.createDate) = :year and month(o.createDate) = :month")
    Page<Order> findOrderByYearAndMonth(@Param("year") Integer year, @Param("month") Integer month, Pageable pageable);
    @Query("SELECT o FROM Order o WHERE o.orderStatus.id = :id and o.createDate between :from and :to")
    Page<Order> findOrderByOrderStatusBetweenDate(@Param("id") Long id, @Param("from")LocalDate from, @Param("to") LocalDate to, Pageable pageable);
    @Query("SELECT o FROM Order o WHERE o.createDate between :from and :to")
    Page<Order> findOrderBetweenDate(@Param("from")LocalDate from, @Param("to") LocalDate to, Pageable pageable);
    @Query("SELECT new com.poly.datn.be.domain.model.ReportProduct(p.id, p.name, SUM(d.sellPrice * d.quantity), SUM(d.quantity), COUNT(o.id)) FROM Attribute a INNER JOIN Product p on a.product.id = p.id INNER JOIN OrderDetail d on a.id = d.attribute.id INNER JOIN Order o on o.id = d.order.id where o.orderStatus.id = 4 group by p.id, p.name ORDER BY sum(d.sellPrice * d.quantity) DESC")
    Page<ReportProduct> reportByProduct(Pageable pageable);

    @Query("SELECT o FROM Order o inner join OrderDetail d on o.id = d.order.id inner join Attribute a on a.id = d.attribute.id inner join Product p on p.id = a.product.id where p.id = :id and o.orderStatus.id = 4")
    Page<Order> findOrderByProduct(@Param("id") Long id, Pageable pageable);
    @Query("SELECT new com.poly.datn.be.domain.model.AmountYear(YEAR(o.createDate), COUNT(o.id), SUM (o.total)) FROM Order o WHERE o.orderStatus.id = 4 GROUP BY YEAR(o.createDate) ORDER BY SUM (o.total) DESC")
    List<AmountYear> reportAmountYear();
    @Query("SELECT new com.poly.datn.be.domain.model.AmountMonth(MONTH(o.createDate), COUNT(o.id), SUM (o.total)) FROM Order o WHERE o.orderStatus.id = 4 AND YEAR(o.createDate) = :year GROUP BY MONTH(o.createDate) ORDER BY SUM (o.total) DESC")
    List<AmountMonth> reportAmountMonth(@Param("year") Integer year);
    @Query("SELECT new com.poly.datn.be.domain.model.CountOrder(s.name, count(o.id)) FROM Order o INNER JOIN OrderStatus s on o.orderStatus.id = s.id GROUP BY s.name")
    List<CountOrder> countOrderByName();
    List<Order> findOrderBySeenEquals(Boolean seen);
}
